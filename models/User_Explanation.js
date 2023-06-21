'use strict';
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../databases/db_words');

class User_Explanation extends Model {
  
}
User_Explanation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    word_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    explanation:{
      type: DataTypes.TEXT,
      allowNull: false,
    },
    likes:{
      type: DataTypes.INTEGER,
      defaultValue:0,
      allowNull: false,
    },
    dislikes:{
      type: DataTypes.INTEGER,
      defaultValue:0,
      allowNull: false,
    },
  },
  {
    sequelize,
    timestamps:true,
    modelName:"User_Explanation",
    tableName:"user_explanations"
  }
);

module.exports = User_Explanation;
