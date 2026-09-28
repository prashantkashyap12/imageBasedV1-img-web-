const Files = require("../../models/TempleteModel/files");
const Template = require("../../models/TempleteModel/templete");
const Assigndata = require("../../models/TempleteModel/assigndata");
const sequelize = require("../../utils/database");
const { DataTypes, Op, QueryTypes } = require("sequelize");

const updateDuplicateData = async (req, res) => {
  try {
    const { id, fileID, rowData } = req.body;

    if (!fileID) {
      return res.status(400).json({ error: "File ID not provided" });
    }

    const fileData = await Files.findByPk(fileID);
    if (!fileData || !fileData.csvFile) {
      return res.status(404).json({ error: "File not found" });
    }

    const { templeteId } = fileData;
    const template = await Template.findByPk(templeteId);
    if (!template) {
      return res.status(400).json({ error: "Template not found" });
    }

    const { csvTableName } = template;
    const keys = Object.keys(rowData)
      .map(
        (key) => `\`${key}\` = :${key.replace(/\s/g, "_").replace(/\./g, "_")}`
      ) // Fix replacement keys
      .join(", ");

    const replacementData = {};
    Object.entries(rowData).forEach(([key, value]) => {
      replacementData[key.replace(/\s/g, "_").replace(/\./g, "_")] = value; // Ensure matching keys
    });

    const [updateResult] = await sequelize.query(
      `UPDATE ${csvTableName} SET ${keys} WHERE id = :id`,
      {
        replacements: { id, ...replacementData },
        type: QueryTypes.UPDATE,
      }
    );

    if (updateResult === 0) {
      return res.status(404).json({ success:false, error: "No record found to update" });
    }

    return res.status(200).json({success:true, message: "Data updated successfully" });
  } catch (error) {
    console.error("Error updating data:", error);
    return res
      .status(500)
      .json({success:false, error: "An error occurred while updating the data" });
  }
};
module.exports = updateDuplicateData;
