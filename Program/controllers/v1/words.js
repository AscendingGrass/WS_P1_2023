const { Op, Sequelize, NOW } = require('sequelize');
const Util = require('../utilities/paketPraktikum');
const Joi = require('joi').extend(require('@joi/date'));
const axios = require('axios');
const jwt = require('jsonwebtoken');
const connection = require('../../databases/db_words');
const {
    User,
} = require('../models/db_words');


module.exports={
    
}