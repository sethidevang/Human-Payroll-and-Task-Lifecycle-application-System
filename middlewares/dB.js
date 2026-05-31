const sequelize = require('../config/database');

const dBConnect = async () => {
    try {
        console.log("Attempting to connect to PostgreSQL...");
        await sequelize.authenticate();
        console.log("Successfully connected to PostgreSQL");

        // Sync all models
        await sequelize.sync({ alter: true }); // Use alter: true to update tables if they already exist
        console.log("Database models synchronized successfully");
    } catch (error) {
        console.error("PostgreSQL connection error occurred: ", error.message);
        throw error;
    }
}

module.exports = dBConnect;