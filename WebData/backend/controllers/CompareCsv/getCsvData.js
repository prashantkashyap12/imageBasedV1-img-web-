const Assigndata = require("../../models/TempleteModel/assigndata");
const sequelize = require("../../utils/database");
const { DataTypes, Op, QueryTypes } = require("sequelize");
const ErrorTable = require("../../models/CompareModel/ErrrorTable");
const ErrorAggregatedTable = require("../../models/CompareModel/ErrorAggregatedTable");
const Templete = require("../../models/TempleteModel/templete");

function groupByPrimaryKey(arr) {
  const grouped = {};

  arr.forEach((item) => {
    const primaryKey = item["PRIMARY"].trim();
    if (!grouped[primaryKey]) {
      grouped[primaryKey] = {
        PRIMARY_KEY: item["PRIMARY KEY"],
        IMAGE_NAME: item["IMAGE_NAME"],
        DATA: [],
      };
    }
    const dataItem = { ...item };
    delete dataItem["PRIMARY"];
    delete dataItem["PRIMARY KEY"];
    delete dataItem["IMAGE_NAME"];
    grouped[primaryKey].DATA.push(dataItem);
  });

  return Object.keys(grouped).map((key) => ({
    PRIMARY: key,
    PRIMARY_KEY: grouped[key].PRIMARY_KEY,
    IMAGE_NAME: grouped[key].IMAGE_NAME,
    DATA: grouped[key].DATA,
  }));
}

const getCsvData = async (req, res) => {
  try {
    const { taskId } = req.params;
    // Fetch 'fileId' and 'currentIndex' in a single query
    const assignData = await Assigndata.findByPk(taskId, {
      attributes: ["fileId", "currentIndex", "templeteId"], // Only fetch necessary columns
    });
    
    if (!assignData) {
      return res.status(404).json({ error: "Task not found" });
    }
    
    const { fileId, currentIndex, templeteId } = assignData;
    
    const templeteData = await Templete.findByPk(templeteId, {
      attributes: ["imageColName"], // Only fetch necessary columns
    });
    const { imageColName } = templeteData;
    
    // Fetch 'file' and 'errorCount' in a single query using COUNT()
    const [file, errorCount] = await Promise.all([
      ErrorTable.findOne({
        where: { fileId, indexTracker: currentIndex },
      }),
      ErrorTable.count({ where: { fileId } }), // Use COUNT instead of findAll
    ]);
    // console.log('taskId',file)

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    const allAggregated = await ErrorAggregatedTable.findAll();
    console.log(
      "ALL aggregated IDs:",
      allAggregated.map((a) => a.errorTableId),
    );

    console.log("CURRENT file.id:", allAggregated);
    
    // Fetch columnData efficiently
    const columnData = await ErrorAggregatedTable.findAll({
      where: { errorTableId: file.id },
    });

    console.log(columnData);

    const filteredColumn = columnData.filter(
      (c) => c.Column_Name !== imageColName,
    );

    console.log(filteredColumn);

    res.status(200).json({
      success: true,
      mainData: file,
      subData: filteredColumn,
      errorCount, // Already counted
      currentIndex,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch data." });
  }
};

module.exports = getCsvData;
