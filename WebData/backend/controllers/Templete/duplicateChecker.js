const Files = require("../../models/TempleteModel/files");
const Template = require("../../models/TempleteModel/templete");
const Assigndata = require("../../models/TempleteModel/assigndata");
const sequelize = require("../../utils/database");
const { DataTypes, Op, QueryTypes } = require("sequelize");

const duplicateChecker = async (req, res) => {
  const { colName, fileID } = req.body;

  try {
    if (!fileID) {
      return res.status(400).json({ error: "File ID not provided" });
    }

    const fileData = await Files.findByPk(fileID);
    if (!fileData || !fileData.csvFile) {
      return res.status(404).json({ error: "File not found" });
    }
    const { templeteId, startIndex, totalFiles } = fileData;
    const lastIndex = startIndex + totalFiles;
    const template = await Template.findByPk(templeteId);
    const { csvTableName } = template;

    const data = await sequelize.query(
      `SELECT \`${colName}\`, COUNT(*) as count FROM ${csvTableName} WHERE id >= ${
        startIndex + 1
      } AND id < ${lastIndex} GROUP BY \`${colName}\` HAVING count > 1`,
      { type: QueryTypes.SELECT }
    );

    if (!data || data.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No duplicates found" });
    }

    return res
      .status(200)
      .json({
        success: true,
        duplicates: data,
        message: data.length + " Duplicates found",
      });
  } catch (error) {
    console.error("Error checking duplicates:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while processing your request" });
  }
};

module.exports = duplicateChecker;
