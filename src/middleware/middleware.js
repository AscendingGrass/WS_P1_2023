const {User} = require("../models");
const jwt = require("jsonwebtoken");
const secret = process.env.SECRET_KEY || "";

const authenticate = async (req, res, next) => {
    const token = req.header('x-auth-token');
    let tokenData = undefined;
    try{
        tokenData = jwt.verify(token, secret);
    }catch(error){
        return res.status(401).json({message: "Invalid JWT token"});
    }
    if(!tokenData){
        return res.status(401).json({message: "Unauthorized"});        
    }
    const user = await User.findByPk(tokenData.id);
    if(!user){
        return res.status(404).json({message: "User not found"});
    }
    req.body.user = user;
    next();
};

module.exports = authenticate;