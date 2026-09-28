const sequelize = require("../../utils/database"); // Import the Sequelize instance
const { QueryTypes } = require("sequelize");
const Template = require("../../models/TempleteModel/templete");

const getCsvHeaderController = async (req, res) => {
  try {
    const { templateId } = req.query;

    // Find the template by ID
    const template = await Template.findByPk(templateId);
    if (!template) {
      return res
        .status(404)
        .json({ success: false, message: "Template not found" });
    }

    const tableName = template.csvTableName;

    // Query to get column names from the database schema
    const columns = await sequelize.query(
      `SHOW COLUMNS FROM \`${tableName}\`;`,
      { type: QueryTypes.SELECT }
    );

    // Extract column names
    const headers = columns.map((col) => col.Field);
    console.log('ZZZZZzZZZZ',headers)

    return res.json({ success: true, headers });
  } catch (error) {
    console.error("Error fetching CSV headers:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

module.exports = getCsvHeaderController;
