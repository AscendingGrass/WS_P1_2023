'use strict';
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../databases/db_words');

class User extends Model {
  
}
User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    api_key:{
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    profile_path:{
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true
    },
    active: {
      type: DataTypes.BOOLEAN,
      default: true,
      allowNull: false
    }
  },
  {
    sequelize,
    timestamps:true,
    modelName:"User",
    tableName:"users"
  }
);

module.exports = User;
