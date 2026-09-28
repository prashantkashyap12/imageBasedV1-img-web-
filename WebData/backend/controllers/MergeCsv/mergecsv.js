const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { DataTypes, Op } = require("sequelize");
const sequelize = require("../../utils/database");
const Files = require("../../models/TempleteModel/files");
const Template = require("../../models/TempleteModel/templete");
// Function to check if files exist in the `files` table
async function checkFilesInDatabase(fileNames) {
  const records = await Files.findAll({
    where: { id: { [Op.in]: fileNames } },
    attributes: ["csvFile"],
  });

  return records.map((record) => record.csvFile);
}

async function createDynamicTable(headers) {
  const tableName = `Table_${Date.now()}`; // Unique table name
  const columns = {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true }, // Explicitly set primary key
  };

  headers.forEach((header) => {
    const normalizedHeader = header

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
    Object.keys(record).forEach((key) =>
      allHeaders.add(key)
    );
  });

  const headersArray = Array.from(allHeaders);

  console.log(`HEADEWR`,headersArray)
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

  return tableName;
}

async function mergeCSVFiles(fileNames) {
  let headersSet = new Set(); // Stores headers from the first file
  let mergedRecords = [];
  let firstFileHeaders = null;

  for (const [index, fileName] of fileNames.entries()) {
    const filePath = path.join(__dirname, "../../csvFile/", fileName);

    if (!fs.existsSync(filePath)) {
      console.warn(`Warning: File not found - ${filePath}`);
      continue;
    }

    try {
      await new Promise((resolve, reject) => {
        let rowIndex = 0; // Row counter
    
        fs.createReadStream(filePath)
          .pipe(csv())
          .on("headers", (headers) => {
            if (index === 0) {
              // Capture headers only from the first file
              firstFileHeaders = headers;
              headersSet = new Set(headers);
            }
          })
          .on("data", (row) => {
            rowIndex++; // Increment row count
            
            if (rowIndex === 1) {
              // Skip second row
              return;
            }
    
            let formattedRow = {};
    
            // Only keep columns that exist in the first file
            if (firstFileHeaders) {
              firstFileHeaders.forEach((header) => {
                formattedRow[header] = row[header] ?? null; // Fill missing values with null
              });
            }
    
            mergedRecords.push(formattedRow);
          })
          .on("end", resolve)
          .on("error", reject);
      });
    } catch (error) {
      console.error(`Error processing file ${fileName}:`, error.message);
    }
    
  }

  return mergedRecords;
}

// Controller function
exports.mergeCSV = async (req, res) => {
  try {
    const { files, templateId } = req.body; // Expecting an array of file names

    const template = await Template.findByPk(templateId);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ message: "Invalid file input" });
    }

    // Check if files exist in the database
    const existingFiles = await checkFilesInDatabase(files);
    if (existingFiles.length !== files.length) {
      return res
        .status(400)
        .json({ message: "One or more files not found in the database" });
    }

    // **Merge CSV Files Before Processing**
    const mergedData = await mergeCSVFiles(existingFiles);

    // Process merged CSV data and insert into SQL table
    const tableName = await processAndInsertCSV(mergedData);
    // **Update the Template with the new table name**

    template.mergedTableName = tableName; // Assign the table name to the template
    await template.save(); // Save the changes
    if (mergedData.length === 0) {
      return res
        .status(400)
        .json({ message: "No valid data found after merging CSV files" });
    }

    return res.status(200).json({ message: "Merged Files Successfully",tableName });
  } catch (error) {
    console.error("Error merging CSV files:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
