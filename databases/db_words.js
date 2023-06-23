const Sequelize = require("sequelize");
const env = process.env.NODE_ENV || 'development';
const {
    database,
    dialect,
    host,
    password,
    port,
    username,
    dialectOptions,
    timezone
} = require('../config/config.json')[env]

module.exports = new Sequelize(database, username, password,{
    host,
    dialect,
    port,
    dialectOptions,
    timezone
})