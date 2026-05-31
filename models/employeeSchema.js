const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Employee = sequelize.define('Employee', {
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    salary: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    designation: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    passportNumber: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    nominee: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    emailNotifications: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    smsNotifications: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'employees',
    timestamps: true // Adds createdAt and updatedAt fields
});

module.exports = Employee;