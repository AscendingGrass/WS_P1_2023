'use strict';
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../../databases/db_words');

class User extends Model {
  
}
User.init(
  {
    user_id:{
        type:DataTypes.STRING(4),
        primaryKey:true,
    },
    display_name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    password:{
        type:DataTypes.STRING,
        allowNull:false
    }
  },
  {
    sequelize,
    timestamps:false,
    modelName:"User",
    tableName:"users"
  }
);

module.exports = User;
