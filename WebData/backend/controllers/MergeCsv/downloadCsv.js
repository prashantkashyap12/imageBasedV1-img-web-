const Template = require("../../models/TempleteModel/templete");
const sequelize = require("../../utils/database");
const { Parser } = require("json2csv");
exports.downloadCsvController = async (req, res) => {
  try {
    const { templateId } = req.query;
    const template = await Template.findByPk(templateId);

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    const tableName = template.mergedTableName;

    // Validate table name (prevent SQL injection)
    if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
      return res.status(400).send("Invalid table name");
    }

    // Dynamically fetch table data
    const [results, metadata] = await sequelize.query(
      `SELECT * FROM ${tableName}`,
      {
        raw: true, // Ensures raw data without extra Sequelize formatting
      }
    );

    if (!results.length) {
      return res.status(404).send("Table is empty or does not exist");
    }

    // Extract column names dynamically from results
    const columns = Object.keys(results[0]); // Get column names
    const json2csvParser = new Parser({ fields: columns }); // Set CSV headers
    const csv = json2csvParser.parse(results); // Convert JSON to CSV format

    // Send CSV file as response
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${tableName}.csv`
    );
    res.setHeader("Content-Type", "text/csv");
    res.status(200).send(csv);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error retrieving data");
  }
};
