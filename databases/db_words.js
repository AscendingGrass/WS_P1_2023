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
    timezone,
    storage
} = require('../config/config.json')[env]

let db;
if(env == 'production_sqlite'){
    db = new Sequelize({
        storage,
        dialect,
        port,
        dialectOptions
    })
}
else{
    db = new Sequelize(database, username, password,{
        host,
        dialect,
        port,
        dialectOptions,
        timezone
    })
}

module.exports = db;