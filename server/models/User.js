const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/db');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Name is required' },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        name: 'unique_user_email',
        msg: 'Email already in use',
      },
      validate: {
        isEmail: { msg: 'Must be a valid email address' },
        notEmpty: { msg: 'Email is required' },
      },
      set(val) {
        if (val) {
          this.setDataValue('email', val.trim().toLowerCase());
        }
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Password is required' },
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
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

// Compare password instance method
User.prototype.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Ensure JSON serialization includes _id
User.prototype.toJSON = function () {
  const values = { ...this.get() };
  values._id = values.id;
  return values;
};

module.exports = User;
