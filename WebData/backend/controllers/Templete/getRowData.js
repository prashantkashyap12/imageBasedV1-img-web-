const Template = require("../../models/TempleteModel/templete");
const Assigndata = require("../../models/TempleteModel/assigndata");
const sequelize = require("../../utils/database");
const { DataTypes, Op, QueryTypes } = require("sequelize");
const path = require("path");
const getAllDirectories = require("../../services/directoryFinder");
const FileData = require("../../models/TempleteModel/files");
const getRowData = async (req, res) => {
  try {
    const { taskId, rowId } = req.query;
    console.log(rowId)
    const assignData = await Assigndata.findByPk(taskId);
    const { templeteId, imageDirectoryPath, fileId, currentIndex } = assignData;
    const template = await Template.findByPk(templeteId);

    const TableName = template.csvTableName;
    const ImageColName = template.imageColName;
    const fileName = await FileData.findByPk(fileId);

    const query = `SELECT * FROM ${TableName} WHERE id = :rowId`;
    const [row] = await sequelize.query(query, {
      replacements: { rowId },
      type: QueryTypes.SELECT,
    });
    // console.log(row)
    const baseName = path.basename(row[ImageColName]);
    const dirs = getAllDirectories(
      path.join(__dirname, "../", "../", "extractedFiles", fileName.zipFile)
    );
    const joinstr = dirs.join("/");

    const maindir = path.join(imageDirectoryPath, joinstr, baseName);
    res
      .status(200)
      .json({
        success: true,
        data: row,
        imageUrl: maindir,
        currentIndex: currentIndex,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to fetch data." });
  }
};
module.exports = getRowData;
