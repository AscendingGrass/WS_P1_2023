'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('users', {  
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      api_key:{
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      profile_path:{
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true
      },
      role: {
        type: Sequelize.INTEGER(1),
        allowNull: false,
        defaultValue: 0,
        comment: "0:user, 1:admin"
      },
      active: {
        type: Sequelize.BOOLEAN,
        default: true,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },
   down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('users');
  }
};