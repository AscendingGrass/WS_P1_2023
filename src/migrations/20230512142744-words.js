'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('words', {  
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      word: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      search_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
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
    return queryInterface.dropTable('words');
  }
};
