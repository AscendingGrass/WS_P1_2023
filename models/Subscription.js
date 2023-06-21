'use strict';
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../databases/db_words');

class Subscription extends Model {
  
}
Subscription.init(
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
    transaction_id:{
      type: DataTypes.INTEGER,
      allowNull: false
    },
    expiration_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
  },
  {
    sequelize,
    timestamps:true,
    modelName:"Subscription",
    tableName:"subscriptions"
  }
);

module.exports = Subscription;
