const path = require("path");
const fs = require("fs");
const csvToJson = require("../../services/csvExtractor");
const { parse } = require("json2csv");
const Template = require("../../models/TempleteModel/templete");
const Assigndata = require("../../models/TempleteModel/assigndata");
const Files = require("../../models/TempleteModel/files");
const ErrorTable = require("../../models/CompareModel/ErrrorTable");
const ErrorAggregatedTable = require("../../models/CompareModel/ErrorAggregatedTable");

const sequelize = require("../../utils/database");
const { DataTypes, Op, QueryTypes } = require("sequelize");
function isBlank(str) {
  console.log(str)
  return !str.trim().length;
}

function normalizeHeader(header) {
  return header
    .replace(/^\uFEFF/, "")   // remove BOM
    .replace(/\s+/g, "")     // remove spaces
    .trim()
    .toLowerCase();
}

function checkHeadersMatch(json1, json2, skippingHeaders = []) {
  if (!json1.length || !json2.length) {
    return { match: false, message: "One or both JSON files are empty." };
  }

  let headers1 = Object.keys(json1[0]).map(normalizeHeader);
  let headers2 = Object.keys(json2[0]).map(normalizeHeader);

  // ✅ FIX HERE
  skippingHeaders = Array.isArray(skippingHeaders)
    ? skippingHeaders.map(normalizeHeader)
    : [];

  headers1 = headers1.filter((header) => !skippingHeaders.includes(header));
  headers2 = headers2.filter((header) => !skippingHeaders.includes(header));

  const missingInJson2 = headers1.filter(
    (header) => header !== "id" && !headers2.includes(header)
  );

  const missingInJson1 = headers2.filter(
    (header) => !headers1.includes(header)
  );

  headers2.forEach(h => console.log([...h]));

  if (missingInJson1.length === 0 && missingInJson2.length === 0) {
    return { match: true, message: "Headers match ✅" };
  }

  return {
    match: false,
    message: `Headers do not match ❌ => File 1 : ${missingInJson2} => File 2 : ${missingInJson1}`,
    details: {
      missingInJson2,
      missingInJson1,
    },
  };
}

async function createDynamicTable(headers) {
  const tableName = `Compare_Result_Table_${Date.now()}`; // Unique table name
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
      columns[normalizedHeader] = { type: DataTypes.STRING(100) }; // Reduce barcode size
    } else if (normalizedHeader.match(/^q[0-9]+$/i)) {
      columns[normalizedHeader] = { type: DataTypes.STRING(10) }; // Short answers (e.g., A, B, C, D, etc.)
    } else {
      columns[normalizedHeader] = { type: DataTypes.STRING(100) }; // Default reduced VARCHAR size
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

  return { resultTable: tableName, headersArray };
}
async function insertGroupedArrayIntoTable(groupedArray) {
  if (!groupedArray || groupedArray.length === 0) {
    throw new Error("No valid data found in groupedArray.");
  }

  // Collect headers dynamically from groupedArray structure
  let allHeaders = new Set();

  groupedArray.forEach((group) => {
    Object.keys(group).forEach((key) => {
      if (key !== "DATA") {
        allHeaders.add(key); // Add top-level keys (e.g., PRIMARY, PRIMARY_KEY, IMAGE_NAME)
      }
    });

    // Collect headers from the nested DATA array
    group.DATA.forEach((dataItem) => {
      Object.keys(dataItem).forEach((key) => allHeaders.add(key));
    });
  });

  const headersArray = Array.from(allHeaders);

  // Create the dynamic table
  const { tableName, DynamicModel } = await createDynamicTable(headersArray);

  // Format records for insertion
  const formattedRecords = [];

  groupedArray.forEach((group) => {
    group.DATA.forEach((dataItem) => {
      const record = {
        PRIMARY: group.PRIMARY,
        PRIMARY_KEY: group.PRIMARY_KEY,
        IMAGE_NAME: group.IMAGE_NAME,
        ...dataItem, // Spread each data entry from the DATA array
      };

      // Ensure all headers are included in each record
      headersArray.forEach((header) => {
        if (!record[header]) record[header] = null; // Fill missing fields with null
      });

      formattedRecords.push(record);
    });
  });

  // Insert data into the dynamic table
  await DynamicModel.bulkCreate(formattedRecords);

  return { resultTable: tableName, headersArray };
}
async function insertData(groupedArray) {
  try {
    await Promise.all(
      groupedArray.map(async (item, index) => {
        const errorEntry = await ErrorTable.create({
          Primary: item.PRIMARY,
          Primary_Key: item.PRIMARY_KEY,
          Image_Name: item.IMAGE_NAME,
          parentId: item.parentId,
          fileId: item.fileId,
          indexTracker: index + 1,
        });

        if (Array.isArray(item.DATA)) {
          const aggregatedData = item.DATA.map((dataItem) => ({
            Column_Name: dataItem.COLUMN_NAME,
            File_1_data: dataItem.FILE_1_DATA??"",
            File_2_data: dataItem.FILE_2_DATA,
            errorTableId: errorEntry.id,
          }));

          console.log(aggregatedData)
          
          const data =  await ErrorAggregatedTable.bulkCreate(aggregatedData);
          console.log(data)
        }
      })
    );

    console.log("Data inserted successfully!");
  } catch (error) {
    console.error("Error inserting data:", error.message || error);
  }
}

// Function to group and sort by PRIMARY key
function groupByPrimaryKey(arr, fileId) {
  const grouped = {};

  arr.forEach((item) => {
    const primaryKey = item["PRIMARY"].trim();
    if (!grouped[primaryKey]) {
      grouped[primaryKey] = {
        PRIMARY_KEY: item["PRIMARY KEY"],
        IMAGE_NAME: item["IMAGE_NAME"],
        DATA: [],
        parentId: item["parentId"],
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
    parentId: grouped[key].parentId,
    fileId,
  }));
}

const compareCsv = async (req, res) => {
  try {
    // Access other form data parameters
    const {
      firstInputFileName,
      secondInputFileName,
      primaryKey,
      imageColName,
      formFeilds,
      zipImageFile,
      templateId,
      fileId,
    } = req.body;
    let { skippingKey } = req.body;
    const template = await Template.findByPk(templateId);
    const tableName = template.csvTableName;
    const fileData = await Files.findByPk(fileId);
    const startIndex = fileData.startIndex;
    skippingKey = skippingKey + ",id";
    // Get table columns dynamically
    const [columns] = await sequelize.query(
      `SHOW COLUMNS FROM \`${tableName}\``
    );

    const columnNames = columns.map((col) => `\`${col.Field}\``).join(", ");

    // Now query the table without the 'id' column
    const tableData = await sequelize.query(
      `SELECT ${columnNames} FROM \`${tableName}\` WHERE id > :startIndex`,
      {
        replacements: { startIndex },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // // Correct SQL syntax with safe variable injection
    // const tableData = await sequelize.query(
    //   `SELECT * FROM \`${tableName}\` WHERE id > :startIndex`,
    //   {
    //     replacements: { startIndex }, // Safe way to inject dynamic values
    //     type: sequelize.QueryTypes.SELECT,
    //   }
    // );

    const firstFilePath = path.join(
      __dirname,
      "../",
      "../",
      "csvFile",
      firstInputFileName
    );
    const secondFilePath = path.join(
      __dirname,
      "../",
      "../",
      "COMPARECSV_FILES",
      "multipleCsvCompare",
      secondInputFileName
    );

    // const f1 = await csvToJson(firstFilePath);
    const f1 = tableData;
    const f2 = await csvToJson(secondFilePath);
  

    if (checkHeadersMatch(f1, f2, skippingKey).match === false) {
      return res.status(501).send({
        err: checkHeadersMatch(f1, f2, skippingKey).message,
        details: checkHeadersMatch(f1, f2, skippingKey).details,
      });
    }
    const diff = [];

    // Logging for debugging
    // for (let i = 0; i < f1.length; i++) {
    //   if (isBlank(f1[i][primaryKey])) {
    //     return res
    //       .status(501)
    //       .send({ err: "Primary key cannot be blank in the first CSV file" });
    //   }
    // }

    // for (let j = 0; j < f2.length; j++) {
    //   if (f2[j][primaryKey] === undefined) {
    //     // console.log(j);
    //   }
    //   if (isBlank(f2[j][primaryKey])) {
    //     return res.status(501).send({
    //       err: "Primary key get/csvheader be blank in the second CSV file",
    //       f2,
    //     });
    //   }
    // }

    const f2Map = new Map(f2.map((item) => [item[primaryKey], item]));

    for (const item1 of f1) {
      const key = item1[primaryKey];

      // Directly access corresponding object in f2 using the map
      const item2 = f2Map.get(key);
      if (!item2) continue; // Skip if no matching primary key in f2

      // Extract image name once (optimization)
      const imgPathArr = item1[imageColName]?.split("\\");
      const imgName = imgPathArr?.[imgPathArr.length - 1] || "";

      for (const [colKey, val1] of Object.entries(item1)) {
        const val2 = item2[colKey];

        // ✅ Check for "*" or blank values in formFields columns
        if (
          formFeilds.includes(colKey) &&
          (val1 === "*" || val1.trim() === "")
        ) {
          diff.push({
            PRIMARY: ` ${key}`,
            COLUMN_NAME: colKey,
            FILE_1_DATA: val1,
            FILE_2_DATA: val2,
            IMAGE_NAME: imgName,
            CORRECTED: "",
            "CORRECTED BY": "",
            "PRIMARY KEY": primaryKey,
            parentId: item1.id,
          });
        }

        // ✅ Check for value mismatch (excluding skipping keys)
        else if (val1 !== val2 && !skippingKey.includes(colKey)) {
          diff.push({
            PRIMARY: ` ${key}`,
            COLUMN_NAME: colKey,
            FILE_1_DATA: val1,
            FILE_2_DATA: val2,
            IMAGE_NAME: imgName,
            CORRECTED: "",
            "CORRECTED BY": "",
            "PRIMARY KEY": primaryKey,
            parentId: item1.id,
          });
        }
      }
    }

    if (diff.length === 0) {
      return res.status(501).send({
        err: "No differences found between the two CSV files.",
      });
    }

    // const { resultTable } = await processAndInsertCSV(diff);
    const csvData = parse(diff);
    const correctedCsv = parse(f1);

    const directoryPath = path.join(
      __dirname,
      "../",
      "../",
      "COMPARECSV_FILES",
      "ErrorCsv"
    );
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }

    const CorrectionDirectoryPath = path.join(
      __dirname,
      "../",
      "../",
      "COMPARECSV_FILES",
      "CorrectedCsv"
    );
    if (!fs.existsSync(CorrectionDirectoryPath)) {
      fs.mkdirSync(CorrectionDirectoryPath, { recursive: true });
    }

    const formatDate = (date) => {
      return date.toISOString().replace(/[:.]/g, "-");
    };

    const errorDate = new Date();
    const errorFilePath = path.join(
      directoryPath,
      `error_${formatDate(errorDate)}.csv`
    );
    fs.writeFile(errorFilePath, csvData, (err) => {
      if (err) {
        console.error("Error writing CSV file:", err);
      } else {
        console.log("CSV file saved successfully.");
      }
    });

    const correctionDate = new Date();
    const correctionFilePath = path.join(
      CorrectionDirectoryPath,
      `corrected_${formatDate(correctionDate)}.csv`
    );
    fs.writeFile(correctionFilePath, correctedCsv, (err) => {
      if (err) {
        console.error("Error writing CSV file:", err);
      } else {
        console.log("CSV file saved successfully.");
      }
    });

    res.set("Content-Type", "text/csv");
    res.set("Content-Disposition", 'attachment; filename="data.csv"');

    const groupedArray = groupByPrimaryKey(diff, fileId);
    const response = await ErrorTable.findAll({
      where: {
        fileId: fileId,
      },
    });
    // console.log('groupedArray', groupedArray)
    // if (response.length > 0) {
    //   // If records are found, throw an error
    //   throw new Error("Records found in ErrorTable");
    // }
    insertData(groupedArray);
    // const resultTedArr = await insertGroupedArrayIntoTable(groupedArray);
    // console.log(f1,"------------------")
    res.status(200).send({
      csvFile: firstFilePath,
      data: groupedArray.length,
      errorFilePath: errorFilePath,
      correctedFilePath: correctionFilePath,
      imageDirectoryName: zipImageFile,
      // tableName: resultTable,
      // file1: f1,
      // file2: f2,
    });
  } catch (err) {
    console.error("Error comparing CSV files:", err);
    res.status(501).send({ error: err.message });
  }
};

module.exports = compareCsv;
