'use strict';
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../databases/db_words');

class Word extends Model {
  
}
Word.init(
  {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      word: {
        type: DataTypes.STRING,
        allowNull: false
      },
      search_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      }
  },
  {
    sequelize,
    timestamps:true,
    modelName:"Word",
    tableName:"words"
  }
);

module.exports = Word;
