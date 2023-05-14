const { Op, Sequelize, NOW } = require('sequelize');
const Joi = require('joi').extend(require('@joi/date'));
const axios = require('axios');
const jwt = require('jsonwebtoken');
const connection = require('../databases/db_words');
const {
    User,
    Explanation_Like,
    Subscription,
    Transaction,
    User_Explanation,
    Word
} = require('../models');

// GET '/words/:keyword'
const getDefinition = async (req, res) => {

}

// GET '/words/random?'
const getRandom = async (req, res) => {

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