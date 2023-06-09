const { Op, Sequelize, NOW } = require("sequelize");
const Joi = require("joi").extend(require("@joi/date"));
const axios = require("axios");
const jwt = require("jsonwebtoken");
const connection = require("../databases/db_words");
const secret = process.env.SECRET_KEY || "";
const {
  User,
  Explanation_Like,
  Subscription,
  Transaction,
  User_Explanation,
  Word,
} = require("../models");

// POST '/words/:keyword'
/*
body:{

}
*/
const getDefinition = async (req, res) => {
  const { keyword } = req.params;
  const apiKey = req.headers["authorization"] || "";
  const token = req.headers["x-auth-token"] || "";

  let flag = false;
  let user = null;

  // check if apiKey or JWT is valid
  if (apiKey) {
    if (apiKey.startsWith("Bearer ")) {
      const key = apiKey.substring(7);
      user = await User.findOne({
        where: {
          api_key: key,
        },
      });

      if (user) {
        flag = true;
      }
    }
  } else if (token) {
    try {
      const data = jwt.verify(token, secret);
      user = await User.findOne({
        where: {
          id: data.id,
        },
      });

      if (user) {
        flag = true;
      }
    } catch (err) {}
  }

  if (!flag) {
    return res.status(403).json({ message: "unauthorized" });
  }

  let result = {};

  // get word definition from dictionaryAPI
  try {
    result.details = (
      await axios.get(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${keyword}`
      )
    ).data;
  } catch (err) {
    const status = err.response.status;
    const message =
      {
        404: "definition not found",
      }[status] || "unhandled error";

    return res.status(status).json({ message });
  }

  const [word, created] = await Word.findOrCreate({
    where: {
      word: String(keyword).toLowerCase(),
    },
  });

  await word.update({
    search_count: word.search_count + 1,
  });

  const bestUserExplanations = await User_Explanation.findAll({
    where: {
      word_id: word.id,
    },
    order: [
      ["likes", "DESC"],
      ["dislikes", "ASC"],
    ],
    limit: 3,
  });

  const trimmedJSONResult = result.details.map((x) => {
    const meanings = x.meanings.map((y) => {
      const definitions = y.definitions.map((z) => z.definition);
      return {
        partOfSpeech: y.partOfSpeech,
        definitions,
      };
    });
    return {
      word: x.word,
      phonetic: x.phonetic,
      meanings,
    };
  });

  const trimmedJSONExplanations = bestUserExplanations.map((x) => {
    return {
      explanation: x.explanation,
      likes: x.likes,
      dislikes: x.dislikes,
    };
  });

  console.log(trimmedJSONExplanations);

  const openaiPromise = axios.post(
    String(process.env.RAPIDAPI_URL),
    {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `this is the definition of ${keyword} taken from dictionaryAPI in the form of a JSON\n
                    ${JSON.stringify(trimmedJSONResult)}\n
                    and these are the user created explanations of ${keyword} that we have in our database and how people perceive it\n
                    ${JSON.stringify(trimmedJSONExplanations)}\n
                    you are needed to make a simplified conclusion of that you think the word means for a web service API`,
        },
        {
          role: "user",
          content: `what does '${keyword}' mean? explain like I'm five`,
        },
      ],
    },
    {
      headers: {
        "content-type": "application/json",
        'Accept-Encoding': 'gzip,deflate,compress',
        "X-RapidAPI-Key": String(process.env.X_RAPIDAPI_KEY),
        "X-RapidAPI-Host": String(process.env.X_RAPIDAPI_HOST),
      },
    }
  );

  try {
    const openaiResult = (await openaiPromise).data
    result.explanations = openaiResult.choices[0].message.content;
  } catch (err) {
    const requestStatus = err.response?.status;
    const responseStatus =
      {
        429: 502,
      }[requestStatus] || 500;
    const message =
      {
        429: "cannot request completions because of too many requests",
      }[requestStatus] || "unhandled error";
    return res.status(responseStatus).json({ message });
  }

  return res.status(200).json(result);
};

// GET '/words/random?'
const getRandom = async (req, res) => {
  const words = Number(req.query.words) || 10;
  const apiKey = req.headers["authorization"] || "";
  const token = req.headers["x-auth-token"] || "";

  let flag = false;
  let user = null;

  // check if apiKey or JWT is valid
  if (apiKey) {
    if (apiKey.startsWith("Bearer ")) {
      const key = apiKey.substring(7);
      user = await User.findOne({
        where: {
          api_key: key,
        },
      });

      if (user) {
        flag = true;
      }
    }
  } else if (token) {
    try {
      const data = jwt.verify(token, secret);
      user = await User.findOne({
        where: {
          id: data.id,
        },
      });

      if (user) {
        flag = true;
      }
    } catch (err) {}
  }

  if (!flag) {
    return res.status(403).json({ message: "unauthorized" });
  }

  const results = (
    await axios.get(`https://random-word-api.vercel.app/api?words=${words}`)
  ).data;
  await Promise.all(
    results.map(
      async (x) =>
        await Word.findOrCreate({
          where: {
            word: String(x).toLowerCase(),
          },
        })
    )
  );
  res.status(200).json({
    count: results.length,
    words: results,
  });
};

// GET '/words?'
const getWords = async (req, res) => {
  const { limit } = req.query;
    const apiKey = req.headers["authorization"] || "";
    const token = req.headers["x-auth-token"] || "";
    let flag = false;
    if (apiKey) {

        if (apiKey.startsWith("Bearer ")) {
            const key = apiKey.substring(7);
            user = await User.findOne({
                where: {
                    api_key: key
                }
            });

            if (user) {
                flag = true;
            }
        }
    }
    else if (token) {
        try {
            const data = jwt.verify(token, secret);
            user = await User.findOne({
                where: {
                    id: data.id
                }
            })

            if (user) {
                flag = true;
            }
        }
        catch (err) { }
    }

    if (!flag) {
        return res.status(403).json({ message: "unauthorized" });
    }
    if (limit) {
        const most_search = await Word.findAll({
            order: [['search_count', 'DESC']],
            limit: parseInt(limit)
        });
        var output = [];
        for (const datae of most_search) {
            var datapush = {
                word : datae.word
            }
            output.push(datapush)
        }
        return res.status(200).send(output)
    } else {
        //defaultnya 5
        const most_search = await Word.findAll({
            order: [['search_count', 'DESC']],
            limit: 5
        });
        var output = [];
        for (const datae of most_search) {
            var datapush = {
                word : datae.word
            }
            output.push(datapush)
        }
        return res.status(200).send(output)
    }
};

// GET '/words/:keyword/similar'
const getSimilarWords = async (req, res) => {
  const { keyword } = req.params;
  const apiKey = req.headers["authorization"] || "";
  const token = req.headers["x-auth-token"] || "";

  let flag = false;
  let user = null;

  // check if apiKey or JWT is valid
  if (apiKey) {
    if (apiKey.startsWith("Bearer ")) {
      const key = apiKey.substring(7);
      user = await User.findOne({
        where: {
          api_key: key,
        },
      });

      if (user) {
        flag = true;
      }
    }
  } else if (token) {
    try {
      const data = jwt.verify(token, secret);
      user = await User.findOne({
        where: {
          id: data.id,
        },
      });

      if (user) {
        flag = true;
      }
    } catch (err) {}
  }

  if (!flag) {
    return res.status(403).json({ message: "unauthorized" });
  }

  let subscription = false;

  if (user.role == 1) {
    subscription = true;
  } else {
    const latestSubscription = await Subscription.findOne({
      where: {
        user_id: user.id,
      },
      order: [["expiration_date", "DESC"]],
    });

    if (
      latestSubscription &&
      new Date(latestSubscription.expiration_date) > new Date()
    ) {
      subscription = true;
    }
  }

  if (!subscription) {
    return res.status(403).json({ message: "you are not subscribed" });
  }

  const result = await axios.post(
    String(process.env.RAPIDAPI_URL),
    {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `list real dictionary words that are similar to or contains or sounds similar to '${keyword}' in array format`,
        },
      ],
    },
    {
      headers: {
        "content-type": "application/json",
        'Accept-Encoding': 'gzip,deflate,compress',
        "X-RapidAPI-Key": String(process.env.X_RAPIDAPI_KEY),
        "X-RapidAPI-Host": String(process.env.X_RAPIDAPI_HOST),
      },
    }
  );

  const resultString = result.data.choices[0].message.content

  const similarWords = resultString
    .substring(resultString.indexOf("[") + 1, resultString.indexOf("]"))
    .replace(/\[/g, "")
    .replace(/\]/g, "")
    .replace(/\"/g, "")
    .replace(/\'/g, "")
    .split(",")
    .map((x) => x.trim());

  return res.status(200).json({
    count: similarWords.length,
    similarWords,
  });
};

module.exports = {
  getDefinition,
  getRandom,
  getWords,
  getSimilarWords,
};
