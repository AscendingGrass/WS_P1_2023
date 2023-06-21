'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('explanation_likes', {  
      user_id: {
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      explanation_id: {
        type: Sequelize.INTEGER,
        primaryKey:true,
        allowNull: false,
        references: {
          model: 'user_explanations',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      status:{
        type: Sequelize.INTEGER(1),
        allowNull: false,
        comment: "0:none, 1:like, 2:dislike"
      },
    });
  },
   down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('explanation_likes');
  }
};
