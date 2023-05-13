'use strict';
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../databases/db_words');

class Transaction extends Model {
  
}
Transaction.init(
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
    order_id:{
      type: DataTypes.STRING,
      allowNull: false
    },
    paid_amount :{
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue:"pending",
      allowNull: false
    },
  },
  {
    sequelize,
    timestamps:true,
    modelName:"Transaction",
    tableName:"transactions"
  }
);

module.exports = Transaction;
