const Template = require("../../models/TempleteModel/templete");
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../../utils/database");
const { QueryTypes } = require("sequelize");

exports.checkTempalte = async (req, res) => {
  try {
    const { files, templateId } = req.body; // Expecting an array of file names

    const template = await Template.findByPk(templateId);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    if (template.mergedTableName) {
      return res.status(200).json({
        success: true,
        message: "Template have merged file",
        tableName: template.mergedTableName,
      });
    }
    return res.status(200).json({ message: "Template has no merged file" });
  } catch (error) {
    console.error("Error checking template:", error.message);
    res.status(500).send("Internal server error");
  }
};

exports.getTableData = async (req, res) => {
  try {
    const { tableName } = req.params; // Get the table name from request params

    if (!tableName) {
      return res
        .status(400)
        .json({ success: false, message: "Table name is required" });
    }

    // Check if the table exists
    const [results] = await sequelize.query(
      `SELECT table_name FROM information_schema.tables WHERE table_name = :tableName`,
      { replacements: { tableName }, type: sequelize.QueryTypes.SELECT }
    );

    if (!results) {
      return res
        .status(404)
        .json({ success: false, message: "Table not found" });
    }

    // Fetch all data from the table using raw SQL
    const [data] = await sequelize.query(`SELECT * FROM ${tableName}`, {
      type: sequelize.QueryTypes.SELECT,
    });

    res.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching table data:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
  }
};

exports.getTableHeaders = async (req, res) => {
  try {
    const { templateId } = req.params;
    if (!templateId) {
      return res.status(400).json({
        success: false,
        message: "Template ID is required",
      });
    }

    // Fetch table name from template
    const template = await Template.findByPk(templateId);
    if (!template || !template.mergedTableName) {
      return res.status(404).json({
        success: false,
        message: "Table not found for the given template ID",
      });
    }

    const tableName = template.mergedTableName;

    // Fetch column names from the table (ensuring correct schema)
    const columns = await sequelize.query(
      `SELECT COLUMN_NAME 
       FROM information_schema.columns 
       WHERE table_name = :tableName 
       AND table_schema = DATABASE()
       ORDER BY ORDINAL_POSITION`, // Ensure correct schema
      { replacements: { tableName }, type: QueryTypes.SELECT }
    );

    if (!columns.length) {
      return res.status(404).json({
        success: false,
        message: `No columns found for table ${tableName}`,
      });
    }

    // Extract column names
    const columnNames = columns.map((col) => col.COLUMN_NAME);

    res.json({ success: true, headers: columnNames });
  } catch (error) {
    console.error("Error fetching table headers:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};