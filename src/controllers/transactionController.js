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

// POST '/subscription/pay'
const addTransaction = async (req, res) => {

}

// POST '/subscription/validate'
const validateSubscriptionTransaction = async (req, res) => {

}

// GET '/transactions?'
const getTransactions = async (req, res) => {

}

module.exports = {
    addTransaction,
    validateSubscriptionTransaction,
    getTransactions,
}