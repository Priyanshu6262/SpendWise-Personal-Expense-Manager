const { sequelize, connectDB } = require('../config/db');
const User = require('./User');
const Transaction = require('./Transaction');

// Define Model Associations
User.hasMany(Transaction, {
  foreignKey: 'userId',
  as: 'transactions',
  onDelete: 'CASCADE',
});

Transaction.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

module.exports = {
  sequelize,
  connectDB,
  User,
  Transaction,
};
