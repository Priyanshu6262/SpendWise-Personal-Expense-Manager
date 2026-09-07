const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Transaction = sequelize.define(
  'Transaction',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Transaction title is required' },
      },
      set(val) {
        if (val) {
          this.setDataValue('title', val.trim());
        }
      },
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: {
          args: [0.01],
          msg: 'Amount must be greater than 0',
        },
      },
    },
    type: {
      type: DataTypes.ENUM('Income', 'Expense'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['Income', 'Expense']],
          msg: 'Transaction type must be Income or Expense',
        },
      },
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Category is required' },
      },
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      set(val) {
        if (val !== undefined && val !== null) {
          this.setDataValue('notes', val.trim());
        } else {
          this.setDataValue('notes', null);
        }
      },
    },
    // Virtual _id for backward compatibility with frontend clients
    _id: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.id;
      },
    },
  },
  {
    tableName: 'transactions',
    timestamps: true,
  }
);

// Ensure JSON serialization includes _id
Transaction.prototype.toJSON = function () {
  const values = { ...this.get() };
  values._id = values.id;
  return values;
};

module.exports = Transaction;
