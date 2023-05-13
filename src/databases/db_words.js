const Sequelize = require("sequelize");
const {
    database,
    dialect,
    host,
    password,
    port,
    username,
    dialectOptions,
    timezone
} = require('../config/db_words.json').test
module.exports = new Sequelize(database, username, password,{
    host,
    dialect,
    port,
    dialectOptions,
    timezone
})