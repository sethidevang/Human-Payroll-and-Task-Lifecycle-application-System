const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attendance = sequelize.define('Attendance', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING(20),
        defaultValue: 'Present'
    },
    clockIn: {
        type: DataTypes.DATE
    },
    clockOut: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'attendance',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['userId', 'date']
        }
    ]
});

module.exports = Attendance;
