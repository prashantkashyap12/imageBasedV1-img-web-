const { parentPort, workerData } = require("worker_threads");
const fs = require("fs");
const csvParser = require("csv-parser");
const { createObjectCsvWriter } = require("csv-writer");

const { originalFilePath, errorFilePath, correctedCsvFilePath, updates, email } = workerData;

const jsonData = [];
const errorJsonFile = [];

// Helper function to read CSV into JSON format (using streams)
const readCsvFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (data) => rows.push(data))
      .on("end", () => resolve(rows))
      .on("error", reject);
  });
};

const writeCsvFile = (filePath, data) => {
  return new Promise((resolve, reject) => {
    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: Object.keys(data[0]).map((key) => ({ id: key, title: key })),
    });
    csvWriter.writeRecords(data).then(resolve).catch(reject);
  });
};

(async () => {
  try {
    // Read both CSV files
    const jsonData = await readCsvFile(originalFilePath);
    const errorJsonFile = await readCsvFile(errorFilePath);

    const updatedErrorJsonFile = errorJsonFile.map((item) => {
      updates.forEach(({ PRIMARY, COLUMN_NAME, CORRECTED }) => {
        if (item.PRIMARY.trim() === PRIMARY.trim() && item.COLUMN_NAME.trim() === COLUMN_NAME.trim()) {
          item.CORRECTED = CORRECTED;
          item["CORRECTED BY"] = email;
        }
      });
      return item;
    });

    // Use a Map for O(1) lookup instead of .find()
    const jsonDataMap = new Map(jsonData.map((item) => [item["PRIMARY KEY"], item]));

    updatedErrorJsonFile.forEach((errorRow) => {
      const primaryKey = errorRow["PRIMARY KEY"];
      const primary = errorRow["PRIMARY"];
      const columnName = errorRow["COLUMN_NAME"];
      const correctedValue = errorRow["CORRECTED"];
      const correctedBy = errorRow["CORRECTED BY"] || "Unknown";

      let findVar = jsonDataMap.get(primary.trim());

      if (findVar) {
        findVar[columnName] = correctedValue;
        if (correctedValue) {
          findVar["Corrected Data"] = findVar["Corrected Data"]
            ? findVar["Corrected Data"] + `, ${columnName}: ${correctedValue}`
            : `${columnName}: ${correctedValue}`;
          findVar["Corrected By"] = correctedBy;
        }
      }
    });

    // Write to CSV
    await writeCsvFile(correctedCsvFilePath, Array.from(jsonDataMap.values()));
    await writeCsvFile(errorFilePath, updatedErrorJsonFile);

    // Send success message back to main thread
    parentPort.postMessage({ success: true, message: "Task updated successfully" });
  } catch (error) {
    parentPort.postMessage({ success: false, error: error.message });
  }
})();
