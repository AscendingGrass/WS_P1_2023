'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('user_explanations', {  
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      word_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'words',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      explanation:{
        type: Sequelize.TEXT,
        allowNull: false,
      },
      likes:{
        type: Sequelize.INTEGER,
        defaultValue:0,
        allowNull: false,
      },
      dislikes:{
        type: Sequelize.INTEGER,
        defaultValue:0,
        allowNull: false,
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
    return queryInterface.dropTable('user_explanations');
  }
};
