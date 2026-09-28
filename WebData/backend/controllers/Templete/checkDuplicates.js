const sequelize = require("../../utils/database"); // Import the Sequelize instance
const { QueryTypes } = require("sequelize");
const Template = require("../../models/TempleteModel/templete");
const MappedData = require("../../models/TempleteModel/mappedData");
const Files = require("../../models/TempleteModel/files");
exports.checkDuplicateController = async (req, res) => {
  try {
    const { header, templateId } = req.body;
    const template = await Template.findByPk(templateId);
    if (!template) {
      return res
        .status(404)
        .json({ success: false, message: "Template not found" });
    }

    // **Validate input to prevent SQL injection**
    if (!header || !tableName) {
      return res.status(400).json({ error: "Invalid table name or column" });
    }

    // **SQL Query to find duplicates**
    const query = `
      SELECT \`${header}\`, COUNT(*) AS count
      FROM \`${tableName}\`
      GROUP BY \`${header}\`
      HAVING COUNT(*) > 1;
    `;

    // **Execute the query using Sequelize**
    const duplicates = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({ duplicates });
  } catch (error) {
    console.error("Error checking duplicates:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.checkMappedDataExistsController = async (req, res) => {
  try {
    const { templateId } = req.query;

    if (!templateId) {
      return res
        .status(400)
        .json({ success: false, message: "templateId is required" });
    }

    const mappedDataRecords = await MappedData.findAll({
      where: { templeteId: templateId },
      attributes: ["key", "value"],
    });
    const records = mappedDataRecords.map((record) => record.dataValues);
    if (mappedDataRecords.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Mapped data already exists",
        records,
      });
    }

    return res
      .status(200)
      .json({ success: true, message: "Mapped data does not exist" });
  } catch (error) {
    console.error("Error checking mapped data:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};
exports.getTotalCsvDataController = async (req, res) => {
  try {
    const { templateId, fileId } = req.query;

    if (!templateId) {
      return res
        .status(400)
        .json({ success: false, message: "Template ID is required" });
    }

    // Find template by ID
    const template = await Template.findByPk(templateId);
    const fileData = await Files.findByPk(fileId);
    if (!template) {
      return res
        .status(404)
        .json({ success: false, message: "Template not found" });
    }
    const tableName = template.csvTableName;
    const startIndex = fileData.startIndex===1 ?fileData.startIndex : +fileData.startIndex +1;
    // const startIndex = fileData.startIndex;
    const [result] = await sequelize.query(
      `
      SELECT COUNT(*) AS count 
      FROM ${tableName}
      WHERE id >= ${startIndex}
    `,
      { type: sequelize.QueryTypes.SELECT }
    );

    return res.status(200).json({ success: true, totalRows: result.count });
  } catch (error) {
    console.error("Error fetching CSV data:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
