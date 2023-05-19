const { Op, Sequelize, NOW } = require('sequelize');
const Joi = require('joi').extend(require('@joi/date'));
const axios = require('axios');
const jwt = require('jsonwebtoken');
const connection = require('../databases/db_words');
const secret = process.env.SECRET_KEY || "";
const {
    User,
    Explanation_Like,
    Subscription,
    Transaction,
    User_Explanation,
    Word
} = require('../models');

// POST '/words/:keyword'
/*
body:{

}
*/
const getDefinition = async (req, res) => {
    const {keyword} = req.params;
    const apiKey = req.headers["authorization"] || "";
    const token  = req.headers["x-auth-token"]  || "";

    let flag = false;
    let user = null;

    // check if apiKey or JWT is valid
    if(apiKey){
        
        if(apiKey.startsWith("Bearer ")){
            const key = apiKey.substring(7);
            user = await User.findOne({
                where : {
                    api_key : key
                }
            });

            if(user){
                flag = true;
            }
        }
    }
    else if(token){
        try{
            const data = jwt.verify(token, secret);
            user = await User.findOne({
                where : {
                    email : data.email
                }
            })

            if(user){
                flag = true;
            }
        }
        catch(err){}
    }

    if(!flag){
        return res.status(403).json({message : "unauthorized"});
    }
    
    let result = {};

    // get word definition from dictionaryAPI
    try{
        result.details = (await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${keyword}`)).data;
    }
    catch(err){
        const status  = err.response.status;
        const message = ({
            404: 'definition not found'
        })[status] || 'unhandled error';

        return res.status(status).json({message});
    }

    const [word, created] = await Word.findOrCreate({
        where : {
            word: String(keyword).toLowerCase()
        }
    })

    await word.update({
        search_count: word.search_count + 1
    })
    
    const bestUserExplanations = await User_Explanation.findAll({
        where:{
            word_id: word.id
        },
        order:[
            ['likes', 'DESC'],
            ['dislikes', 'ASC']
        ] ,
        limit:3
    })

    const trimmedJSONResult = result.details.map(x => {
        const meanings = x.meanings.map(y => {
            const definitions = y.definitions.map(z => z.definition)
            return {
                partOfSpeech: y.partOfSpeech,
                definitions
            }
        })
        return {
            word: x.word,
            phonetic: x.phonetic,
            meanings
        }
    })

    const trimmedJSONExplanations = bestUserExplanations.map(x => {
        return {
            explanation:x.explanation, 
            likes:x.likes, 
            dislikes: x.dislikes
        };
    })

    console.log(trimmedJSONExplanations)

    const openaiPromise = axios.post(String(process.env.RAPIDAPI_URL), {
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'system',
                content: `this is the definition of ${keyword} taken from dictionaryAPI in the form of a JSON\n
                    ${JSON.stringify(trimmedJSONResult)}\n
                    and these are the user created explanations of ${keyword} that we have in our database and how people perceive it\n
                    ${JSON.stringify(trimmedJSONExplanations)}\n
                    you are needed to make a simplified conclusion of that you think the word means for a web service API`
            },
            {
                role: 'user',
                content: `what does '${keyword}' mean? explain like I'm five`
            }
        ]
    },{
        headers:{
            'content-type': 'application/json',
            'X-RapidAPI-Key': String(process.env.X_RAPIDAPI_KEY),
            'X-RapidAPI-Host': String(process.env.X_RAPIDAPI_HOST)
        }
    })
    
    try{
        result.explanations = (await openaiPromise).data.choices[0].text;
    }
    catch(err){
        const requestStatus  = err.response.status;
        const responseStatus = ({
            429: 502
        })[requestStatus] || 500;
        const message = ({
            429: 'cannot request completions because of too many requests'
        })[requestStatus] || 'unhandled error';
        return res.status(responseStatus).json({message});
    }

    return res.status(200).json(result);
}

// GET '/words/random?'
const getRandom = async (req, res) => {
    const words = Number(req.query.words) || 10;
    const apiKey = req.headers["authorization"] || "";
    const token  = req.headers["x-auth-token"]  || "";

    let flag = false;
    let user = null;

    // check if apiKey or JWT is valid
    if(apiKey){
        
        if(apiKey.startsWith("Bearer ")){
            const key = apiKey.substring(7);
            user = await User.findOne({
                where : {
                    api_key : key
                }
            });

            if(user){
                flag = true;
            }
        }
    }
    else if(token){
        try{
            const data = jwt.verify(token, secret);
            user = await User.findOne({
                where : {
                    email : data.email
                }
            })

            if(user){
                flag = true;
            }
        }
        catch(err){}
    }

    if(!flag){
        return res.status(403).json({message : "unauthorized"});
    }

    const results = (await axios.get(`https://random-word-api.vercel.app/api?words=${words}`)).data
    await Promise.all(results.map(async x => await Word.findOrCreate({
        where : {
            word: String(x).toLowerCase()
        }
    })))
    res.status(200).json({
        count: results.length,
        words: results
    })
}

// GET '/words?'
const getWords = async (req, res) => {

}

// GET '/words/:keyword/similar'
const getSimilarWords = async (req, res) => {

}

module.exports = {
    getDefinition,
    getRandom,
    getWords,
    getSimilarWords
}