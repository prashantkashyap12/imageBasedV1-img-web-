const Template = require("../../models/TempleteModel/templete");
const Assigndata = require("../../models/TempleteModel/assigndata");
const sequelize = require("../../utils/database");
const MappedData = require("../../models/TempleteModel/mappedData");
const MetaData = require("../../models/TempleteModel/metadata");
const { DataTypes, QueryTypes, Op } = require("sequelize");
const path = require("path");
const FileData = require("../../models/TempleteModel/files");
const getAllDirectories = require("../../services/directoryFinder");

async function createDynamicTable(headers) {
  const tableName = `assign_${Date.now()}`; // Unique table name
  const columns = {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true }, // Explicitly set primary key
  };

  headers.forEach((header) => {
    const normalizedHeader = header;

    // Assign appropriate data types based on column content
    if (
      normalizedHeader.toLowerCase().includes("image") ||
      normalizedHeader.toLowerCase().includes("details") ||
      normalizedHeader.toLowerCase().includes("values") ||
      normalizedHeader.toLowerCase().includes("updated_col")
    ) {
      columns[normalizedHeader] = { type: DataTypes.TEXT }; // Large text-based columns
    } else if (normalizedHeader.toLowerCase().includes("barcode")) {
      columns[normalizedHeader] = { type: DataTypes.TEXT('long') }; // Reduce barcode size
    } else if (normalizedHeader.match(/^q[0-9]+$/i)) {
      columns[normalizedHeader] = { type: DataTypes.TEXT('long') }; // Short answers (e.g., A, B, C, D, etc.)
    } else {
      columns[normalizedHeader] = { type: DataTypes.TEXT('long') }; // Default reduced VARCHAR size
    }
  });

  const DynamicModel = sequelize.define(tableName, columns, {
    timestamps: false,
  });

  await DynamicModel.sync();
  // Extract the actual table name from the model
  const actualTableName = DynamicModel.getTableName();
  return { tableName: actualTableName, DynamicModel };
}

// Function to read CSV files and insert into the dynamic table
async function processAndInsertCSV(mergedRecords) {
  if (!mergedRecords || mergedRecords.length === 0) {
    throw new Error("No valid data found in the merged CSV data.");
  }

  // Collect all unique headers from the merged data
  let allHeaders = new Set();
  mergedRecords.forEach((record) => {
    Object.keys(record).forEach((key) => allHeaders.add(key));
  });

  const headersArray = Array.from(allHeaders);
  headersArray.push("Corrected");
  headersArray.push("Corrected_By");

  const { tableName, DynamicModel } = await createDynamicTable(headersArray);

  // Ensure each record has all headers
  const formattedRecords = mergedRecords.map((record) => {
    let formattedRecord = {};
    headersArray.forEach((header) => {
      formattedRecord[header] = record[header] ?? null; // Fill missing columns with null
    });
    return formattedRecord;
  });

  await DynamicModel.bulkCreate(formattedRecords);

  return { tableName, headersArray };
}

const getCsvTableData = async (req, res) => {
  try {
    const { id } = req.body.taskData;
    const assignedData = await Assigndata.findOne({ where: { id } });

    if (!assignedData) {
      return res.status(404).json({ error: "Assigned data not found" });
    }

    const { templeteId, min, max, currentIndex, fileId, tableName } =
      assignedData;
    const fileName = await FileData.findByPk(fileId);
    const template = await Template.findByPk(templeteId);

    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    const { patternDefinition, blankDefination, csvTableName, imageColName } =
      template;
    // if(!currentIndex){
    //     const query = `SELECT * FROM ${csvTableName} WHERE '`;
    // }
    const columns = await MappedData.findAll({
      where: {
        templeteId: templeteId,
        [Op.and]: [
          { value: { [Op.ne]: null } }, // not NULL
          { value: { [Op.ne]: "" } }, // not blank
        ],
      },
      attributes: ["key", "value"],
    });

    // console.log(columns);
    const metaData = await MetaData.findAll({
      where: {
        templeteId: templeteId,
      },
    });

    // Optimized column filtering
    const formFieldValues = new Set(
      metaData
        .filter((meta) => meta.fieldType === "formField")
        .map((meta) => meta.attribute)
    );

    const questionFieldValues = new Set(
      metaData
        .filter((meta) => meta.fieldType === "questionsField")
        .map((meta) => meta.attribute)
    );

    const FormCol = columns
      .filter((col) => formFieldValues.has(col.value))
      .map((col) => col.key);

    const QuestionCol = columns
      .filter((col) => questionFieldValues.has(col.value))
      .map((col) => col.key);

    if (!columns.length) {
      return res
        .status(404)
        .json({ success: false, error: "No relevant columns found" });
    }
    if (assignedData.tableName) {
      let indexToSearch = currentIndex;

      if (currentIndex == min) {
        // const query = `SELECT id FROM \`${assignedData.tableName}\` WHERE parentId >= ${min} ORDER BY parentId ASC LIMIT 1`;
        // const [countId] = await sequelize.query(query, {
        //   type: sequelize.QueryTypes.SELECT,
        // });
        // indexToSearch = countId.id;
        // assignedData.currentIndex = indexToSearch;
        // await assignedData.save();
      }

      try {
        const template = await Template.findByPk(templeteId);
        const maintable = template.csvTableName;
        const query = `SELECT * FROM \`${assignedData.tableName}\` WHERE id = :indexToSearch`;
        const [result] = await sequelize.query(query, {
          replacements: { indexToSearch },
          type: sequelize.QueryTypes.SELECT, // Ensures SELECT query type
        });
        const countQuery = `SELECT COUNT(*) as total FROM \`${assignedData.tableName}\``;
        const [countResult] = await sequelize.query(countQuery, {
          type: sequelize.QueryTypes.SELECT,
        });
        const parentId = result.parentId;
        const querytwo = `SELECT * FROM \`${maintable}\` WHERE id = :parentId`;

        const [resultTwo] = await sequelize.query(querytwo, {
          replacements: { parentId },
          type: sequelize.QueryTypes.SELECT, // Ensures SELECT query type
        });
        const imageName = resultTwo[imageColName];
        const baseName = path.basename(imageName);
        // console.log(baseName);
        const formData = {};
        const questionData = {};

        const dirs = getAllDirectories(
          path.join(__dirname, "../", "../", "extractedFiles", fileName.zipFile)
        );
        const joinstr = dirs.join("/");

        const maindir = path.join(fileName.zipFile, joinstr, baseName);
        console.log(maindir)

        Object.entries(resultTwo).forEach(([key, value]) => {
          if (FormCol.includes(key)) {
            formData[key] = value;
          }
          if (QuestionCol.includes(key)) {
            questionData[key] = value;
          }
        });
        return res.status(200).json({
          success: true,
          formdata: formData,
          questionData: questionData,
          total_error: countResult.total,
          imageName: maindir,
          currentIndex: currentIndex,
          id: result.parentId,
        });
      } catch (error) {
        console.error("Error executing query:", error.message);
        return res
          .status(500)
          .json({ success: false, error: "Internal Server Error" });
      }
    }

    const columnNames = columns.map((col) => `\`${col.key}\``);
    const startingCsvIndex = fileName.startIndex;

    // const conditions = columnNames
    //   .map((col) => `${col} = :patternDefinition OR ${col} = :blankDefination`)
    //   .join(" OR ");
console.log('columnName', columnNames)
    const conditions = columnNames
      .map(
        (col) =>
          `${col} LIKE :patternDefinition 
       OR ${col} LIKE :blankDefination 
       OR ${col} = '' 
       OR ${col} IS NULL`
      )
      .join(" OR ");
    const query = `
      SELECT * FROM \`${csvTableName}\`
      WHERE id BETWEEN :min AND :max
      AND (
        ${conditions}
        )
        `;

    const filteredData = await sequelize.query(query, {
      replacements: {
        min:
          Number(startingCsvIndex) === 1
            ? Number(min)
            : Number(min) + Number(startingCsvIndex),
        max:
          Number(startingCsvIndex) === 1
            ? Number(max)
            : Number(max) + Number(startingCsvIndex),
        patternDefinition: `%${patternDefinition}%`,
        blankDefination: `%${blankDefination}%` || null || "",
      },
      type: sequelize.QueryTypes.SELECT,
    });
    // console.log(filteredData);

    const updatedFilteredData = filteredData.map(({ id }) => ({
      parentId: id,
    }));
    // console.log(updatedFilteredData)
    const assignedTableName = await processAndInsertCSV(updatedFilteredData);
    assignedData.tableName = assignedTableName.tableName;
    await assignedData.save();
    if (!filteredData.length) {
      return res.status(404).json({ error: "No matching data found" });
    }

    // Split data into formData and questionData
    const formData = {};
    const questionData = {};
    const primaryId = filteredData[currentIndex - 1].id;
    const imageName = filteredData[currentIndex - 1][imageColName];
    const baseName = path.basename(imageName);
    Object.entries(filteredData[currentIndex - 1]).forEach(([key, value]) => {
      if (FormCol.includes(key)) {
        formData[key] = value;
      }
      if (QuestionCol.includes(key)) {
        questionData[key] = value;
      }
    });
    const dirs = getAllDirectories(
      path.join(__dirname, "../", "../", "extractedFiles", fileName.zipFile)
    );
    const joinstr = dirs.join("/");

    const maindir = path.join(fileName.zipFile, joinstr, baseName);

    return res.status(200).json({
      success: true,
      formdata: formData,
      questionData: questionData,
      total_error: filteredData.length,
      imageName: maindir,
      currentIndex: currentIndex,
      id: primaryId,
    });
  } catch (error) {
    console.error("Error fetching CSV table data:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error", error });
  }
};

module.exports = getCsvTableData;
