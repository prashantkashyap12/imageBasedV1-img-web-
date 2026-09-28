const Files = require("../../models/TempleteModel/files");
const Assigndata = require("../../models/TempleteModel/assigndata");
const Templete = require("../../models/TempleteModel/templete");
const sequelize = require("../../utils/database");
const { Parser } = require("json2csv"); // For converting JSON to CSV

const downloadSeparateCsv = async (req, res) => {
  try {
    const taskId = req.params.id;
    // console.log(taskId);
    const assigndata = await Assigndata.findByPk(taskId);
    if (!assigndata) {
      return res.status(404).json({ error: "Assignment data not found" });
    }

    const template = await Templete.findByPk(assigndata.templeteId);
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }
    const fileData = await Files.findOne({
      where: { id: assigndata.fileId },
    });
    if (!fileData) {
      return res.status(404).json({ error: "file not found" });
    }

    const allAssignedData = await Assigndata.findAll({
      where: { templeteId: assigndata.templeteId, fileId: assigndata.fileId },
    });
    const taskStatus = allAssignedData.filter(
      (assign) => assign.taskStatus === false
    );
    // const TaskStatusFlag = true;
    if (taskStatus.length > 0) {
      // Send warning headers to the frontend
      res.setHeader("X-Incomplete-Tasks", "true");
      res.setHeader("X-Incomplete-Count", String(taskStatus.length));
    }
    // console.log(taskStatus);

    const assignedDataResults = await Promise.all(
      allAssignedData.map((assign) =>
        sequelize.query(`SELECT * FROM \`${assign.tableName}\``, {
          type: sequelize.QueryTypes.SELECT,
        })
      )
    );
    // console.log(assignedDataResults)
    const mergedAssignedData = assignedDataResults.flat();

    const maintableName = template.csvTableName;

    const [columns] = await sequelize.query(
      `SHOW COLUMNS FROM \`${maintableName}\``
    );

    const columnNames = columns
      .map((col) => `\`${col.Field}\``)
      .filter((col) => col !== "`id`")
      .join(", ");
    // console.log(columnNames);
    let start, end;

    // coerce to numbers safely
    const sIdx = Number(fileData.startIndex) || 0;
    const total = Number(fileData.totalFiles) || 0;

    // Decide start/end (adjust logic to match your semantics).
    // Here: when startIndex === 1 means rows from 1..(1+total-1).
    // otherwise start from (startIndex + 1) for appended files.
    if (sIdx === 1) {
      start = 1;
      end = sIdx + total - 1;
    } else {
      // sIdx likely contains the count of existing rows before this file was inserted
      start = sIdx + 1;
      end = sIdx + total;
    }

    // build select columns safely — if no extra columns, select all
    const selectCols =
      columnNames && columnNames.trim().length > 0 ? `id, ${columnNames}` : "*";

    // validate range
    let mainData;
    if (Number.isInteger(start) && Number.isInteger(end) && start <= end) {
      mainData = await sequelize.query(
        `SELECT ${selectCols}
     FROM \`${maintableName}\`
     WHERE id BETWEEN :start AND :end`,
        {
          replacements: { start, end },
          type: sequelize.QueryTypes.SELECT,
        }
      );
    } else {
      // fallback: return full table (or handle as error)
      mainData = await sequelize.query(
        `SELECT ${selectCols} FROM \`${maintableName}\``,
        { type: sequelize.QueryTypes.SELECT }
      );
    }

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
    const json2csvParser = new Parser();
    const csvData = json2csvParser.parse(mergedData);
    // console.log(mergedData);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${maintableName}.csv`
    );

    res.setHeader("Content-Type", "text/csv");

    // expose custom headers to frontend
    res.setHeader(
      "Access-Control-Expose-Headers",
      "X-Incomplete-Tasks, X-Incomplete-Count"
    );

    // send the file
    res.send(csvData);
  } catch (error) {}
};
module.exports = downloadSeparateCsv;
