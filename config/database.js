const { Sequelize } = require('sequelize');

// Create a Sequelize instance and connect to the local PostgreSQL database
// Adjust the credentials and database name as needed
const sequelize = new Sequelize('hr_suite', 'postgres', 'password', {
    host: 'localhost',
    dialect: 'postgres',
    logging: false, // Set to true to see SQL queries in the console
});

module.exports = sequelize;
