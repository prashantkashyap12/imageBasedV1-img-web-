const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const Assigndata = require("../../models/TempleteModel/assigndata");
const ErrorTable = require("../../models/CompareModel/ErrrorTable");
const ErrorAggregatedTable = require("../../models/CompareModel/ErrorAggregatedTable");
const Files = require("../../models/TempleteModel/files");
const Template = require("../../models/TempleteModel/templete");
const sequelize = require("../../utils/database");
const { DataTypes, Op, QueryTypes } = require("sequelize");

function readCSVAndConvertToJSON(filePath) {
  return new Promise((resolve, reject) => {
    const jsonArray = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        jsonArray.push(row);
      })
      .on("end", () => {
        console.log("CSV file successfully processed");
        resolve(jsonArray);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

function writeJSONToCSV(filePath, jsonArray) {
  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(filePath);
    writeStream.write(
      "PRIMARY,COLUMN_NAME,FILE_1_DATA,FILE_2_DATA,IMAGE_NAME,CORRECTED,CORRECTED BY,PRIMARY KEY\n"
    );
    jsonArray.forEach((row) => {
      writeStream.write(
        `${row.PRIMARY},${row.COLUMN_NAME},${row.FILE_1_DATA},${row.FILE_2_DATA},${row.IMAGE_NAME},${row.CORRECTED},${row["CORRECTED BY"]},${row["PRIMARY KEY"]}\n`
      );
    });
    writeStream.end();
    writeStream.on("finish", resolve);
    writeStream.on("error", reject);
  });
}

const csvUpdateData = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { email } = req.user;
    const { taskId } = req.params;
    const { updated, parentId, errorDataId } = req.body;

    if (!updated || !Array.isArray(updated)) {
      return res.status(400).json({ message: "Invalid update data provided" });
    }

    const task = await Assigndata.findOne({ where: { id: taskId } });
    if (!task) return res.status(404).json({ message: "Task not found" });

    const template = await Template.findByPk(task.templeteId);
    if (!template)
      return res.status(404).json({ message: "Template not found" });

    const { csvTableName } = template;

    const errorTable = await ErrorTable.findOne({
      where: { id: errorDataId },
    });
    const newData = updated.map((item) => {
      const { Column_Name, Corrected } = item;
      return { [Column_Name]: Corrected };
    });
    errorTable.CorrectedBy = req.user.email;
    const copyObj = errorTable.Corrected || "{}"; // Ensure it's never null
    const copyObjParsed = JSON.parse(copyObj);

    // Merge existing data with new updates correctly
    const mergedUpdates = {
      ...copyObjParsed,
      ...Object.assign({}, ...newData),
    };

    // Convert merged object to JSON string
    errorTable.Corrected = JSON.stringify(mergedUpdates);

    await errorTable.save();
    for (const update of updated) {
      const { id, Corrected, Column_Name } = update;

      if (!/^[a-zA-Z0-9_]+$/.test(Column_Name)) {
        await transaction.rollback();
        return res
          .status(400)
          .json({ message: "Invalid column name detected" });
      }

      const errorAggregatedRow = await ErrorAggregatedTable.findOne({
        where: { id },
        transaction,
      });

      if (errorAggregatedRow) {
        errorAggregatedRow.Corrected = Corrected;
        // errorAggregatedRow["Corrected By"] = email;
        await errorAggregatedRow.save({ transaction });
      }

      await sequelize.query(
        `UPDATE ${csvTableName} SET \`${Column_Name}\` = :correctedValue WHERE id = :parentId`,
        {
          replacements: { correctedValue: Corrected, parentId },
          type: QueryTypes.UPDATE,
          transaction,
        }
      );
    }

    await transaction.commit();
    res
      .status(200)
      .json({ success: true, message: "Data updated successfully" });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Error in csvUpdateData:", error);
    res
      .status(500)
      .json({ message: "An error occurred while updating the task" });
  }
};

module.exports = csvUpdateData;
