'use strict';
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../databases/db_words');

class Explanation_Like extends Model {
  
}
Explanation_Like.init(
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey:true,
      allowNull: false,
    },
    explanation_id: {
      type: DataTypes.INTEGER,
      primaryKey:true,
      allowNull: false,
    },
    status:{
      //0:none, 1:like, 2:dislike
      type: DataTypes.INTEGER(1),
      allowNull: false,
    },
  },
  {
    sequelize,
    timestamps:false,
    modelName:"Explanation_Like",
    tableName:"explanation_likes"
  }
);

module.exports = Explanation_Like;
