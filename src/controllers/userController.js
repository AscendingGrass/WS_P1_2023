const { Op, Sequelize, NOW } = require('sequelize');
const Joi = require('joi').extend(require('@joi/date'));
const axios = require('axios');
const jwt = require('jsonwebtoken');
const connection = require('../databases/db_words');
const {
    User,
} = require('../models');


module.exports={
    
}