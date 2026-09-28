const lockfile = require("proper-lockfile");
const fs = require("fs").promises;
const path = require("path");
const { csvToJson, jsonToCsv } = require("./csvUtils"); // Helper functions

const updateCsvTask = async ({ taskId, updates, user }) => {
  try {
    console.log(`Updating CSV for task ${taskId}...`);

    const task = await Assigndata.findOne({ where: { id: taskId } });
    if (!task) throw new Error("Task not found");

    const { errorFilePath, correctedCsvFilePath, fileId } = task;
    if (!errorFilePath || !correctedCsvFilePath) throw new Error("File paths missing");

    const fileData = await Files.findOne({ where: { id: fileId } });
    if (!fileData) throw new Error("File not found");

    const originalFilePath = path.resolve(__dirname, "../../csvFile", fileData.csvFile);

    try {
      await fs.access(originalFilePath);
    } catch (err) {
      throw new Error("Original file not found");
    }

    const resolvedErrorFilePath = path.resolve(errorFilePath);
    try {
      await fs.access(resolvedErrorFilePath);
    } catch (err) {
      throw new Error("Error file not found");
    }

    // Lock the file to prevent concurrent writes
    const releaseLock = await lockfile.lock(correctedCsvFilePath, { stale: 5000 });

    try {
      let jsonData = await csvToJson(originalFilePath);
      let errorJsonFile = await csvToJson(resolvedErrorFilePath);

      const updatedErrorJsonFile = errorJsonFile.map((item) => {
        updates.forEach(({ PRIMARY, COLUMN_NAME, CORRECTED }) => {
          if (
            item.PRIMARY.trim() === PRIMARY.trim() &&
            item.COLUMN_NAME.trim() === COLUMN_NAME.trim()
          ) {
            item.CORRECTED = CORRECTED;
            item["CORRECTED BY"] = user.email;
          }
        });
        return item;
      });

      updatedErrorJsonFile.forEach((errorRow) => {
        const primaryKey = errorRow["PRIMARY KEY"];
        const primary = errorRow["PRIMARY"];
        const columnName = errorRow["COLUMN_NAME"];
        const correctedValue = errorRow["CORRECTED"];
        const correctedBy = errorRow["CORRECTED BY"] || "Unknown";

        let findVar = jsonData.find(
          (item) => item[primaryKey] == primary.trim()
        );

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

      // Write to a temporary file first
      const tempCorrectedFilePath = correctedCsvFilePath + ".tmp";
      const tempErrorFilePath = resolvedErrorFilePath + ".tmp";

      await fs.writeFile(tempCorrectedFilePath, jsonToCsv(jsonData));
      await fs.writeFile(tempErrorFilePath, jsonToCsv(updatedErrorJsonFile));

      // Rename the temp files
      await fs.rename(tempCorrectedFilePath, correctedCsvFilePath);
      await fs.rename(tempErrorFilePath, resolvedErrorFilePath);
    } finally {
      releaseLock();
    }

    console.log(`CSV update for task ${taskId} completed.`);
  } catch (error) {
    console.error("CSV Update Error:", error);
    throw error;
  }
};

module.exports = updateCsvTask;
