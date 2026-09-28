const Assigndata = require("../../models/TempleteModel/assigndata");
const Templete = require("../../models/TempleteModel/templete");
const { Parser } = require("json2csv"); // For converting JSON to CSV
const sequelize = require("../../utils/database");
const assignTask = require("../CompareCsv/assignTask");

const downloadMergedCsv = async (req, res) => {
  try {
    const taskId = req.params.id;
    const assigndata = await Assigndata.findByPk(taskId);
    if (!assigndata) {
      return res.status(404).json({ error: "Assignment data not found" });
    }

    const template = await Templete.findByPk(assigndata.templeteId);
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    const allAssignedData = await Assigndata.findAll({
      where: { templeteId: assigndata.templeteId },
    });


    // Fetch all assigned data tables in parallel
    const assignedDataResults = await Promise.all(
      allAssignedData.map((assign) =>
        sequelize.query(`SELECT * FROM \`${assign.tableName}\``, {
          type: sequelize.QueryTypes.SELECT,
        })
      )
    );
    const mergedAssignedData = assignedDataResults.flat();


    const maintableName = template.csvTableName;

    // Get table columns dynamically
    const [columns] = await sequelize.query(
      `SHOW COLUMNS FROM \`${maintableName}\``
    );

    //  console.log(columns)
    const columnNames = columns
      .map((col) => `\`${col.Field}\``)
      .filter((col) => col !== "`id`")
      .join(", ");

    // Fetch main table data
    const mainData = await sequelize.query(
      `SELECT id, ${columnNames} FROM \`${maintableName}\``,
      {
        type: sequelize.QueryTypes.SELECT,
      }
    );
// console.log(mainData)
    // Merge the data based on parentId
    const mergedData = mainData.map((row) => {
      const matchedRow = mergedAssignedData.find(
        (assigned) => Number(assigned.parentId) === Number(row.id)
      );
   
      return matchedRow
        ? {
            ...row,
            Corrected: matchedRow.Corrected,
            Corrected_By: matchedRow.Corrected_By,
          }
        : row;
    });

    if (!mergedData.length) {
      return res
        .status(404)
        .json({ error: "No data available in the main table" });
    }

    // Convert JSON data to CSV
    const json2csvParser = new Parser();
    const csvData = json2csvParser.parse(mergedData);

    // Set response headers for CSV download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${maintableName}.csv`
    );
    res.setHeader("Content-Type", "text/csv");
    res.send(csvData);
  } catch (error) {
    console.error("Error downloading CSV:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = downloadMergedCsv;
