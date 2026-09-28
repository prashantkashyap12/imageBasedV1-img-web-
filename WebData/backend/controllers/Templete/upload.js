const multer = require("multer");
const XLSX = require("xlsx");
const Files = require("../../models/TempleteModel/files");
const path = require("path");
const fs = require("fs-extra");
const unzipper = require("unzipper");
const { DataTypes, Op, QueryTypes } = require("sequelize");
const csv = require("csv-parser");
const { createExtractorFromFile } = require("node-unrar-js");
const sequelize = require("../../utils/database");
const getAllDirectories = require("../../services/directoryFinder");
const jsonToCsv = require("../../services/json_to_csv");
const Templete = require("../../models/TempleteModel/templete");
const csvToJson = require("../../services/csvExtractor");

// Multer memory storage for chunk uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

async function insertDataIntoTable(tableName, data, batchSize = 500) {
  if (!data || data.length === 0) return;

  // Step 1: Normalize column names and trim spaces
  const normalizedData = data.map((row) => {
    const normalizedRow = {};
    Object.keys(row).forEach((key) => {
      const trimmedKey = key.trim();
      normalizedRow[trimmedKey] = row[key];
    });
    return normalizedRow;
  });

  // Step 2: Get column names from the first row
  const columnsForRead = Object.keys(normalizedData[0]);
  const columns = columnsForRead.map((col) => `\`${col}\``);

  // Step 3: Insert in batches
  for (let i = 0; i < normalizedData.length; i += batchSize) {
    const batch = normalizedData.slice(i, i + batchSize);

    // Build batch VALUES SQL
    const values = batch
      .map(
        (row) =>
          `(${columnsForRead
            .map((col) => {
              let val = row[col] ?? "";

              // Convert to string & escape characters safely
              if (typeof val === "string") {
                val = val
                  .trim()
                  .replace(/\\/g, "\\\\") // Escape backslashes
                  .replace(/'/g, "\\'"); // Escape single-quotes
              }

              return `'${val}'`;
            })
            .join(",")})`
      )
      .join(",");



    const query = `INSERT INTO \`${tableName}\` (${columns.join(
      ","
    )}) VALUES ${values};`;

    // Execute batch insert
    await sequelize.query(query, { type: QueryTypes.INSERT });

    // console.log(`Inserted batch: ${i} → ${i + batch.length}`);
  }

  return columnsForRead;
}

/**
 * Function to process the uploaded CSV file
 * - Reads the CSV file from the specified path
 * - Converts the CSV data to JSON and updates image paths
 * - Saves the updated CSV file back to the original path
 */
async function processCSV(filePath, res, req, createdFile, pathDir) {
  if (fs.existsSync(filePath)) {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, {
      raw: true,
      defval: "",
    });

    // Get column names from the request and check for missing columns
    const colNames = req.query.imageNames.split(",");
    const updatedJson = data.map((obj) => obj);
    const missingCols = colNames.filter(
      (colName) => !updatedJson[0].hasOwnProperty(colName)
    );
    if (missingCols.length > 0) {
      return res.status(400).json({
        error: `Image column name(s) not found: ${missingCols.join(", ")}`,
      });
    }

    // Update image paths in the JSON data
    colNames.forEach((colName) => {
      const column = colName.replaceAll('"', "");
      updatedJson.forEach((obj) => {
        const imagePath = obj[column];
        const filename = path.basename(imagePath);
        obj[column] = `${pathDir}/${filename}`;
      });
    });

    // Delete the old CSV file and save the updated content
    fs.unlinkSync(filePath);
    const updatedCSVContent = jsonToCsv(updatedJson);
    fs.writeFileSync(filePath, updatedCSVContent, {
      encoding: "utf8",
    });

    res.status(200).json({ fileId: createdFile.id });
    console.log("File processed successfully");
  } else {
    res.status(404).json({ error: "CSV File not found" });
  }
}

/**
 * Function to save the uploaded chunk to a specified directory
 */
async function saveChunk(chunkDir, chunkIndex, buffer) {
  const chunkFileName = `${chunkIndex}.chunk`;
  const chunkFilePath = path.join(chunkDir, chunkFileName);

  console.log("Saving chunk file to:", chunkFilePath);
  await fs.writeFile(chunkFilePath, buffer);

  if (!fs.existsSync(chunkFilePath)) {
    console.error("Chunk file write failed:", chunkFilePath);
    throw new Error("Failed to save chunk file.");
  }
}

/**
 * Function to merge all uploaded chunks into a single file
 */
async function mergeChunks(chunkDir, uploadDir, zipFileName, totalChunks) {
  const timestamp = Math.floor(Date.now() / 1000);
  const finalFilePath = path.join(uploadDir, `${timestamp}_${zipFileName}`);
  const writeStream = fs.createWriteStream(finalFilePath);

  for (let i = 0; i < totalChunks; i++) {
    const chunkPath = path.join(chunkDir, `${i}.chunk`);
    console.log("Reading chunk from:", chunkPath);
    const data = await fs.readFile(chunkPath);
    const canWrite = writeStream.write(data);

    if (!canWrite) {
      await new Promise((resolve) => writeStream.once("drain", resolve));
    }

    await fs.remove(chunkPath);
  }

  writeStream.end();
  return finalFilePath;
}

async function extractZipFile(finalFilePath, destinationFolderPath) {
  // Ensure destination folder exists
  await fs.ensureDir(destinationFolderPath);

  // Check if the uploaded file is a ZIP file
  const fileExtension = path.extname(finalFilePath).toLowerCase();
  if (fileExtension === ".rar") {
    try {
      const extractor = await createExtractorFromFile({
        filepath: finalFilePath,
        targetPath: destinationFolderPath,
      });
      const files = [...extractor.extract().files];
      return { success: true, files };
    } catch (err) {
      console.error("Extraction failed:", err);
      return { success: false, error: err };
    }
  }

  return new Promise((resolve, reject) => {
    fs.createReadStream(finalFilePath)
      .pipe(unzipper.Extract({ path: destinationFolderPath }))
      .on("close", resolve)
      .on("error", (err) => {
        console.error("Extraction error:", err);
        reject(
          new Error("Error during ZIP extraction. Make sure the file is valid.")
        );
      });
  });
}

async function createDynamicTable(headers) {
  const tableName = `Table_${Date.now()}`; // Unique table name
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
    } else if (normalizedHeader.match(/q[0-9]+$/i)) {
      columns[normalizedHeader] = { type: DataTypes.STRING(30) }; // Short answers (e.g., A, B, C, D, etc.)
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

async function processAndInsertCSV(mergedRecords) {
  if (!mergedRecords || mergedRecords.length === 0) {
    throw new Error("No valid data found in the merged CSV data.");
  }

  // Collect all unique sanitized headers
  let allHeaders = new Set();
  mergedRecords.forEach((record) => {
    // Object.keys(record).forEach((key) => allHeaders.add(key.trim().replace(/\s+/g, "")));
    Object.keys(record).forEach((key) => allHeaders.add(key.trim()));
  });

  const headersArray = Array.from(allHeaders);

  // Create dynamic table
  const { tableName, DynamicModel } = await createDynamicTable(headersArray);

  const formattedRecords = mergedRecords.map((record) => {
    const formattedRecord = {};

    headersArray.forEach((header) => {
      let value = record[header];

      if (typeof value === "string") value = value.trim();

      formattedRecord[header] = value ?? null;
    });

    return formattedRecord;
  });

  // Insert in batches
  const BATCH_SIZE = 500;

  for (let i = 0; i < formattedRecords.length; i += BATCH_SIZE) {
    const chunk = formattedRecords.slice(i, i + BATCH_SIZE);

    await DynamicModel.bulkCreate(chunk, { ignoreDuplicates: true });
  }

  return { tableName, headersArray };
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

const handleUpload = async (req, res) => {

  // Step 2: Configure Multer for chunk and CSV file upload
  const uploadMiddleware = upload.fields([
    { name: "chunk", maxCount: 1 },
    { name: "csvFile", maxCount: 1 },
  ]);

  // Step 3: Handle the file upload process
  uploadMiddleware(req, res, async (err) => {
    if (err) {
      console.error("Multer Error:", err);
      return res.status(400).json({ error: "Error uploading file." });
    }

    const { id } = req.params;
    const { chunkIndex, totalChunks, zipFileName } = req.body;

    if (!req.files.chunk) {
      return res.status(400).json({ error: "No chunk file uploaded." });
    }

    const uploadDir = path.join(__dirname, "..", "..", "zipFile");
    const chunkDir = path.join(uploadDir, "chunks");
    const csvFileDir = path.join(__dirname, "../../csvFile");

    try {
      // Ensure necessary directories exist
      await fs.ensureDir(chunkDir);
      await fs.ensureDir(uploadDir);
      await fs.ensureDir(csvFileDir);

      // Step 4: Save the uploaded chunk
      // await saveChunk(chunkDir, chunkIndex, req.files.chunk[0].buffer);

      // const timestamp = Math.floor(Date.now() / 1000);
      // const originalCSVFileName = req.files.csvFile[0].originalname;
      // const csvFileName = `${timestamp}_${originalCSVFileName}`;
      // const csvFilePath = path.join(csvFileDir, csvFileName);

      // // Step 5: If the last chunk, process merging and extraction
      // if (parseInt(chunkIndex, 10) + 1 === parseInt(totalChunks, 10)) {
      //   // Save the CSV file only on the last chunk
      //   if (req.files.csvFile) {
      //     console.log("Saving CSV file to:", csvFilePath);
      //     await fs.writeFile(csvFilePath, req.files.csvFile[0].buffer);

      //     if (!fs.existsSync(csvFilePath)) {
      //       console.error("CSV file write failed:", csvFilePath);
      //       return res.status(500).json({ error: "Failed to save CSV file." });
      //     }
      //   }

      await saveChunk(chunkDir, chunkIndex, req.files.chunk[0].buffer);
      const timestamp = Math.floor(Date.now() / 1000);


      if (parseInt(chunkIndex, 10) + 1 === parseInt(totalChunks, 10)) {

        if (!req.files.csvFile || !req.files.csvFile[0]) {
          console.error("CSV file missing on last chunk request.");
          return res.status(400).json({ error: "CSV file is required on the final chunk." });
        }

        const originalCSVFileName = req.files.csvFile[0].originalname;
        const csvFileName = `${timestamp}_${originalCSVFileName}`;
        const csvFilePath = path.join(csvFileDir, csvFileName);

        await fs.writeFile(csvFilePath, req.files.csvFile[0].buffer);

        if (!fs.existsSync(csvFilePath)) {
          console.error("CSV file write failed:", csvFilePath);
          return res.status(500).json({ error: "Failed to save CSV file." });
        }

        // Step 6: Merge all chunks into a final ZIP file
        const finalFilePath = await mergeChunks(
          chunkDir,
          uploadDir,
          zipFileName,
          totalChunks
        );

        // Step 7: Extract the final ZIP file
        const destinationFolderPath = path.join(
          __dirname,
          "../../extractedFiles",
          `${timestamp}_${zipFileName}`
        );

        await extractZipFile(finalFilePath, destinationFolderPath);

        // Step 8: Process the extracted files and CSV
        const allDirectories = getAllDirectories(destinationFolderPath);

        // console.log(allDirectories, "allDirectories");

        if (!allDirectories || allDirectories.length === 0) {
          console.error("No directories found after extraction.");
          return res.status(500).json({
            error: "Extraction failed. No directories found.",
          });
        }

        const pathDir = `${timestamp}_${zipFileName}/${allDirectories.join(
          "/"
        )}`;
        const templateTable = await Templete.findByPk(id);
        if (!templateTable.csvTableName) {
          const mergedData = await mergeCSVFiles([csvFileName]);

          const { tableName, headersArray } = await processAndInsertCSV(
            mergedData
          );


          const createdFile = await Files.create({
            startIndex: 1,
            totalFiles: mergedData.length,
            csvFileTable: tableName,
            csvFile: csvFileName,
            zipFile: `${timestamp}_${zipFileName}`,
            templeteId: id,
          });
          const template = await Templete.findByPk(id);
          template.csvTableName = tableName;
          template.imageColName = req.query.imageNames;
          await template.save();
          res.status(200).json({
            success: true,
            message: `New Table Created.`,
            templeteId: id,
            fileId: createdFile.id,
          });

        } else {
          const [result] = await sequelize.query(
            `SELECT COUNT(*) AS count FROM \`${templateTable.csvTableName}\``,
            { type: sequelize.QueryTypes.SELECT }
          );
          const csvJson = await csvToJson(csvFilePath);
          const batches = chunkArray(csvJson, 500); // split CSV rows into 500 rows each
          let columns = null;

          for (let i = 0; i < batches.length; i++) {
            console.log(`Inserting batch ${i + 1} of ${batches.length}`);

            const batchColumns = await insertDataIntoTable(
              templateTable.csvTableName,
              batches[i] // send only one batch
            );

            // Save columns once (same for all batches)
            if (!columns) columns = batchColumns;
          }
          const createdFile = await Files.create({
            startIndex: result.count,
            totalFiles: csvJson.length,
            csvFile: csvFileName,
            zipFile: `${timestamp}_${zipFileName}`,
            templeteId: id,
          });
          res.status(200).json({
            success: true,
            message: `Inserted into existing table.`,
            templeteId: id,
            fileId: createdFile.id,
          });
          //insert the csv file into the table
        }
      } else {
        res
          .status(200)
          .json({ success: true, message: `Chunk ${chunkIndex} uploaded.` });
      }
    } catch (error) {
      console.error("Error during chunk upload:", error);
      res.status(500).json({ success: false, error: "Chunk upload failed." });
    }
  });
};

function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
module.exports = handleUpload;
