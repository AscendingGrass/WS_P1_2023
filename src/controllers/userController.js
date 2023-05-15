const { Op, Sequelize, NOW } = require("sequelize");
const Joi = require("joi").extend(require("@joi/date"));
const axios = require("axios");
const jwt = require("jsonwebtoken");
const connection = require("../databases/db_words");
const {
  User,
  Explanation_Like,
  Subscription,
  Transaction,
  User_Explanation,
  Word,
} = require("../models");
const { getAPI } = require("../utilities/paketPraktikum");

// GET '/users?'
const getUsers = async (req, res) => {};

// GET '/users/:id'
const getUser = async (req, res) => {};

// POST '/users'
const addUser = async (req, res) => {
  let { name, password, email } = req.body;
  const schema = Joi.object({
    name: Joi.string().required().messages({
      "string.empty": "Invalid data field",
    }),
    password: Joi.string().min(8).required().messages({
      "string.empty": "Invalid data field",
    }),
    confirm_password: Joi.string()
      .required()
      .valid(Joi.ref("password"))
      .messages({
        "string.empty": "Invalid data field",
        "any.only": "Password do not match",
      }),
    email: Joi.string().email().required().messages({
      "string.email": "Invalid email address",
      "string.empty": "Invalid data field",
    }),
  });

  try {
    await schema.validateAsync(req.body);
  } catch (error) {
    return res.status(403).send(error.toString());
  }

  let checkEmail = await User.findAll({
    where: {
      email: {
        [Op.eq]: email,
      },
    },
  });

  if (checkEmail.length !== 0) {
    return res.status(400).json({ message: "Email already in use" });
  }

  var api = getAPI();

  const addUser = await User.create({
    name: name,
    password: password,
    email: email,
    api_key: api,
    profile_path: null,
    active: 1,
    createdAt: null,
    updatedAt: null,
  });

  return res.status(200).json({
    name: name,
    email: email,
    api_key: api,
  });
};

// POST '/users/login'
const loginUser = async (req, res) => {
  const schema = Joi.object({
    password: Joi.string().required().messages({
      "string.empty": "Invalid data field",
    }),
    email: Joi.string().email().required().messages({
      "string.email": "Invalid email address",
      "string.empty": "Invalid data field",
    }),
  });

  try {
    await schema.validateAsync(req.body);
  } catch (error) {
    return res.status(403).send(error.toString());
  }

  let { email, password } = req.body;
  const findUser = await User.count({
    where: {
      email: email,
    },
  });
  if (findUser == 0) {
    return res
      .status(400)
      .json({ message: "The user has not been registered" });
  }

  const checkPass = await User.findAll({
    where: {
      email: email,
      password: password,
    },
  });

  if (checkPass.length == 0) {
    return res.status(400).json({ message: "Incorrect Password" });
  }

  let token = jwt.sign(
    {
      email: email,
      api_key: checkPass[0].api_key,
    },
    process.env.SECRET_KEY,
    { expiresIn: "3600s" }
  );
  return res.status(200).json({
    email: email,
    token: token,
    message: "You have successfully logged in to your account.",
  });
};

// DELETE '/users'
const deleteUser = async (req, res) => {};

// PUT '/users/profile'
const updateUserProfilePicture = async (req, res) => {};

// PUT '/users/password'
const updateUserPassword = async (req, res) => {};

// POST '/users/:id/key'
const regenerateApiKey = async (req, res) => {};

module.exports = {
  getUsers,
  getUser,
  addUser,
  loginUser,
  deleteUser,
  updateUserProfilePicture,
  updateUserPassword,
  regenerateApiKey,
};
