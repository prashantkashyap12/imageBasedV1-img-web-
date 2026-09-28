const { Worker, QueueEvents } = require("bullmq");
const Redis = require("ioredis");
const fs = require("fs");
const path = require("path");
const csvToJson = require("./csv_to_json"); // Helper functions for CSV processing
const jsonToCsv = require("./json_to_csv");// Helper functions for CSV processing
const Assigndata = require("../models/TempleteModel/assigndata"); // Import your Sequelize model
const Files = require("../models/TempleteModel/files");

const redisOptions = {
    host: "127.0.0.1",
    port: 6379,
    maxRetriesPerRequest: null, // ✅ This is required for BullMQ
  };

const connection = new Redis(redisOptions);

const worker = new Worker(
  "csvUpdateQueue",
  async (job) => {
    try {
      console.log(`Processing job ID: ${job.id} for task: ${job.data.taskId}`);

      const { taskId, updates, userEmail } = job.data;

      // Fetch the task
      const task = await Assigndata.findOne({ where: { id: taskId } });
      if (!task) throw new Error("Task not found");

      const { errorFilePath, correctedCsvFilePath, fileId } = task;
      if (!errorFilePath || !correctedCsvFilePath) throw new Error("File paths missing");

      if (!fileId) throw new Error("fileId not found");

      const fileData = await Files.findOne({ where: { id: fileId } });
      if (!fileData) throw new Error("File not found");

      const originalFilePath = path.resolve(__dirname, "../../csvFile", fileData.csvFile);

      try {
        await fs.promises.access(originalFilePath);
      } catch {
        throw new Error("Original file not found");
      }

      const resolvedErrorFilePath = path.resolve(errorFilePath);
      if (!(await fs.promises.access(resolvedErrorFilePath).then(() => true).catch(() => false))) {
        throw new Error("Error file not found");
      }

      // Convert CSV to JSON
      let jsonData = await csvToJson(originalFilePath);
      let errorJsonFile = await csvToJson(resolvedErrorFilePath);

      // Apply updates
      const updatedErrorJsonFile = errorJsonFile.map((item) => {
        updates.forEach(({ PRIMARY, COLUMN_NAME, CORRECTED }) => {
          if (item.PRIMARY.trim() === PRIMARY.trim() && item.COLUMN_NAME.trim() === COLUMN_NAME.trim()) {
            item.CORRECTED = CORRECTED;
            item["CORRECTED BY"] = userEmail;
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

        let findVar = jsonData.find((item) => item[primaryKey] == primary.trim());

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

      await fs.promises.writeFile(tempCorrectedFilePath, jsonToCsv(jsonData));
      await fs.promises.writeFile(tempErrorFilePath, jsonToCsv(updatedErrorJsonFile));

      // Rename the temp files
      await fs.promises.rename(tempCorrectedFilePath, correctedCsvFilePath);
      await fs.promises.rename(tempErrorFilePath, resolvedErrorFilePath);

      console.log(`Job ID: ${job.id} completed successfully!`);
      return { message: "Task updated successfully", updatedErrorJsonFile };
    } catch (error) {
      console.error(`Error processing job ID: ${job.id}`, error);
      throw error;
    }
  },
  { connection }
);

// Log queue events (optional)
const queueEvents = new QueueEvents("csvUpdateQueue", { connection });
queueEvents.on("completed", ({ jobId }) => {
  console.log(`✅ Job ${jobId} completed successfully.`);
});
queueEvents.on("failed", ({ jobId, failedReason }) => {
  console.log(`❌ Job ${jobId} failed: ${failedReason}`);
});

// Keep the worker running
console.log("🚀 Worker is running...");
