const Files = require("../../models/TempleteModel/files");
const Template = require("../../models/TempleteModel/templete");
const Assigndata = require("../../models/TempleteModel/assigndata");
const sequelize = require("../../utils/database");
const { DataTypes, Op, QueryTypes } = require("sequelize");
const path = require("path");
const getAllDirectories = require("../../services/directoryFinder");

const getCsvRowData = async (req, res) => {
  try {
    const { rowId, fileId } = req.query;

    if (!fileId) {
      return res.status(400).json({ error: "fileId not found" });
    }
    const fileData = await Files.findByPk(fileId);
    if (!fileData) {
      return res.status(404).json({ error: "File not found" });
    }
    const { templeteId, zipFile } = fileData;
    const template = await Template.findByPk(templeteId);
    if (!template) {
      return res.status(400).json({ error: "Template not found" });
    }

    const { csvTableName, imageColName } = template;

    const [data] = await sequelize.query(
      `SELECT * FROM ${csvTableName} WHERE id = ${rowId} `,
      {
        type: QueryTypes.SELECT,
      }
    );

    const baseName = path.basename(data[imageColName]);
    const dirs = getAllDirectories(
      path.join(__dirname, "../", "../", "extractedFiles", zipFile)
    );
    const joinstr = dirs.join("/");

    const maindir = path.join(zipFile, joinstr, baseName);

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "No data available to download" });
    }

    return res
      .status(200)
      .json({ success: true, rowData: data, imageUrl: maindir });
  } catch (error) {
    console.error("Error processing CSV file:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while processing your request" });
  }
};

module.exports = getCsvRowData;
