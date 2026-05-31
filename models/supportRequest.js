const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SupportRequest = sequelize.define('SupportRequest', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    issue: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    tableName: 'support_requests',
    timestamps: true, // This will handle createdAt automatically
    updatedAt: false
});

module.exports = SupportRequest;