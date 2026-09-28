const Sequelize = require("sequelize");

const sequelize = require("../../utils/database");

const ErrorTable = sequelize.define("errorTable", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  Primary: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  Primary_Key: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  Image_Name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  parentId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  fileId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  indexTracker: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  Corrected: {
    type: Sequelize.TEXT,
  },
  CorrectedBy: {
    type: Sequelize.STRING,
  },
});

module.exports = ErrorTable;
