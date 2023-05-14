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


// POST '/explanations'
const addExplanation = async (req, res) => {

}

// PUT '/explanations'
const updateExplanation = async (req, res) => {

}

// DELETE '/explanations'
const deleteExplanation = async (req, res) => {

}

// PUT '/explanations/:id/likes'
const updateExplanationLikes = async (req, res) => {

}

// GET '/explanations?'
const getExplanations = async (req, res) => {

}


module.exports = {
    addExplanation,
    updateExplanation,
    deleteExplanation,
    updateExplanationLikes,
    getExplanations
}