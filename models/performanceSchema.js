const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PerformanceReview = sequelize.define('PerformanceReview', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    lastReviewDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    nextReviewDate: {
        type: DataTypes.DATEONLY
    },
    rating: {
        type: DataTypes.INTEGER
    },
    feedback: {
        type: DataTypes.TEXT
    }
}, {
    tableName: 'performance_reviews',
    timestamps: true
});

module.exports = PerformanceReview;
