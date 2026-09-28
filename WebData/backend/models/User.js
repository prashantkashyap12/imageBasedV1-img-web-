// models/User.js
const { DataTypes } = require("sequelize");
const sequelize = require("../utils/database");

const User = sequelize.define(
  "User",
  {
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mobile: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    permissions: {
      type: DataTypes.JSON,
      allowNull: false,
      get() {
        const raw = this.getDataValue("permissions");
        try {
          return typeof raw === "string" ? JSON.parse(raw) : raw;
        } catch {
          return raw;
        }
      },
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ["userName"],
      },
      {
        unique: true,
        fields: ["mobile"],
      },
      {
        unique: true,
        fields: ["email"],
      },
    ],
  }
);

module.exports = User;
