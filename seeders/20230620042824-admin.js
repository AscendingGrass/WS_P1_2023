'use strict';
/** @type {import('sequelize-cli').Migration} */

const bcrypt = require("bcrypt");
const crypto = require('crypto');

const users = [];
users.push({
  name: 'admin',
  password: bcrypt.hashSync('admin', 10),
  email: 'admin@gmail.com',
  api_key: crypto.randomUUID(),
  createdAt: new Date(),
  role: 1
})

module.exports = {
  async up (queryInterface, Sequelize) {
    return await queryInterface.bulkInsert("users", users);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete("users", null, {truncate: true});
  }
};
