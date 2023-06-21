'use strict';
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../databases/db_words');
const { randomUUID } = require('crypto');
const Util = require('../utilities/paketPraktikum');

class Transaction extends Model {
    static generateOrderId(user){
      const userId = String(user.id).padStart(4,'0')
      return "ORDER-" + userId + "-" + Util.getCurrentDateDMY().replace("/","").replace("/","") + "-" + randomUUID().substring(0,13)
    }
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
      defaultValue: null,
      allowNull: true
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
