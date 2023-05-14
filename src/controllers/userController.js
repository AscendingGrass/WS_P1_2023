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

// GET '/users?'
const getUsers = async (req, res) => {

}

// GET '/users/:id'
const getUser = async (req, res) => {

}

// POST '/users'
const addUser = async (req, res) => {

}

// POST '/users/login'
const loginUser = async (req, res) => {

}

// DELETE '/users'
const deleteUser = async (req, res) => {

}

// PUT '/users/profile'
const updateUserProfilePicture = async (req, res) => {

}

// PUT '/users/password'
const updateUserPassword = async (req, res) => {

}

// POST '/users/:id/key'
const regenerateApiKey = async (req, res) => {

}

module.exports = {
    getUsers,
    getUser,
    addUser,
    loginUser,
    deleteUser,
    updateUserProfilePicture,
    updateUserPassword,
    regenerateApiKey
}