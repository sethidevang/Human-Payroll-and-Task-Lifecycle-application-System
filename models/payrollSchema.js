const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payroll = sequelize.define('Payroll', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    paymentDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    nextPaymentDate: {
        type: DataTypes.DATEONLY
    },
    status: {
        type: DataTypes.STRING(20),
        defaultValue: 'Paid'
    }
}, {
    tableName: 'payroll',
    timestamps: true
});

module.exports = Payroll;
