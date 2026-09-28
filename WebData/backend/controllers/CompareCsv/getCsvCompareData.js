const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const Assigndata = require("../../models/TempleteModel/assigndata");
const groupByPrimaryKey = require("../../services/groupingCsvData");
const MappedData = require("../../models/TempleteModel/mappedData");
const getAllDirectories = require("../../services/directoryFinder");
const fastCsv = require("fast-csv");
function readCSVAndConvertToJSON(filePath) {
  return new Promise((resolve, reject) => {
    const jsonArray = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        jsonArray.push(row);
      })
      .on("end", () => {
        resolve(jsonArray);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}
let csvCache = null; // Store CSV data in-memory
let cacheTimeout = null;

const clearCache = () => {
  csvCache = null;
  console.log("CSV cache cleared due to inactivity");
};

const resetCacheTimer = () => {
  if (cacheTimeout) clearTimeout(cacheTimeout);
  cacheTimeout = setTimeout(clearCache, 30 * 60 * 1000); // 30 minutes
};

// Load CSV into memory on server start
const loadCsvIntoMemory = (csvFilePath,PRIMARY_KEY) => {
  return new Promise((resolve, reject) => {
    const dataMap = {};
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on("data", (row) => {
        const primaryKey = row[PRIMARY_KEY]; // Adjust key as per your CSV structure
        dataMap[primaryKey] = row;
      })
      .on("end", () => {
        csvCache = dataMap;
        console.log("CSV cached successfully");
        resolve();
      })
      .on("error", reject);
  });
};
// const getCsvCompareData = async (req, res) => {

//   const { taskId } = req.params;
//   const task = await Assigndata.findOne({ where: { id: taskId } });
//   if (!task) {
//     return res.status(404).json({ message: "Task not found" });
//   }

//   const {
//     max,
//     min,
//     templeteId,
//     id,
//     errorFilePath,
//     correctedCsvFilePath,
//     imageDirectoryPath,
//     csvFilePath,
//   } = task;
//   const taskTempleteId = templeteId;
//   const minIndex = parseInt(min);
//   const maxIndex = parseInt(max);
//   const { currentIndex } = req.body;

//   if (!maxIndex || !minIndex) {
//     return res.status(400).json({ message: "Max and min values are required" });
//   }

//   if (currentIndex === undefined || currentIndex === null) {
//     return res.status(400).json({ message: "Current index is required" });
//   }

//   if (!(currentIndex >= minIndex && currentIndex <= maxIndex)) {
//     return res.status(400).json({ message: "Invalid current index" });
//   }

//   if (!csvFilePath) {
//     return res.status(400).json({ message: "CSV file path is required" });
//   }

//   try {
//     const errorJsonFile = await readCSVAndConvertToJSON(errorFilePath);
//     const groupedData = groupByPrimaryKey(errorJsonFile);
//     const absoluteFilePath = path.resolve(csvFilePath);

//     const results = [];
//     let mappedReponse = [];

//     const currentTask = await Assigndata.findOne({ where: { id: taskId } });
//     if (!currentTask) {
//       return res.status(404).json({ message: "Task not found" });
//     }

//     await currentTask.update({ currentIndex });

//     fs.createReadStream(absoluteFilePath)
//       .pipe(csv())
//       .on("data", (data) => results.push(data))
//       .on("end", async () => {
//         const mappedData = await MappedData.findAll({
//           where: {
//             templeteId: taskTempleteId,
//           },
//         });

//         const keyValuePair = mappedData.map((item) => ({
//           [item.key]: item.value,
//         }));

//         mappedReponse = keyValuePair;

//         const mergedObject = keyValuePair.reduce((acc, obj) => {
//           const key = Object.keys(obj)[0];
//           const value = obj[key];
//           acc[key] = value;
//           return acc;
//         }, {});

//         const resultsWithIndex = results.map((result, index) => ({
//           ...result,
//           rowIndex: minIndex + index,
//         }));
//         resultsWithIndex.unshift(mergedObject);

//         const filteredResults = resultsWithIndex
//           .map((result) => {
//             const filterValue = groupedData[0].PRIMARY_KEY;
//             const matchingGroupedData = groupedData.find(
//               (group) => group.PRIMARY === result[filterValue]
//             );
//             return matchingGroupedData ? { ...result } : null;
//           })
//           .filter((result) => result !== null);

//         let imageFile = path.join(
//           __dirname,
//           "../",
//           "../",
//           "extractedFiles",
//           imageDirectoryPath
//         );

//         const imageFolders = getAllDirectories(imageFile);
//         imageFolders.forEach((folder) => {
//           imageFile = path.join(imageFile, folder);
//         });

//         // const prefixToRemove ="D:\\Omr\\CSV\\WEB_DATA_CONVERSION_BACKEND_4.0\\extractedFiles";
//         // const result = imageFile.replace(prefixToRemove, "");

//         const result = imageFile.split("extractedFiles\\")[1];
//         res.status(200).json({
//           message: "Data found",
//           data: {
//             previousData: groupedData[currentIndex - 1],
//             max: maxIndex,
//             min: minIndex,
//             filteredResults: filteredResults[currentIndex - 1],
//             imageDirectoryPath: result,
//             mappedReponse
//           },
//         });
//       })
//       .on("error", (error) => {
//         console.error("Error reading CSV file:", error);
//         res.status(500).json({ error: "Error reading CSV file" });
//       });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// const getCsvCompareData = async (req, res) => {
//   const { taskId } = req.params;
//   const { currentIndex } = req.body;

//   if (currentIndex === undefined || currentIndex === null) {
//     return res.status(400).json({ message: "Current index is required" });
//   }

//   try {
//     // Fetch Task Details
//     const task = await Assigndata.findOne({ where: { id: taskId } });
//     if (!task) return res.status(404).json({ message: "Task not found" });

//     const {
//       max,
//       min,
//       templeteId,
//       errorFilePath,
//       csvFilePath,
//       imageDirectoryPath,
//     } = task;
//     const minIndex = parseInt(min),
//       maxIndex = parseInt(max);

//     if (!maxIndex || !minIndex || !csvFilePath) {
//       return res.status(400).json({ message: "Invalid task data" });
//     }
//     if (currentIndex < minIndex || currentIndex > maxIndex) {
//       return res.status(400).json({ message: "Invalid current index" });
//     }

//     // Fetch Mapped Data (Keep Only Required Key-Value Pairs)
//     const mappedData = await MappedData.findAll({
//       where: { templeteId },
//       attributes: ["key", "value"],
//       raw: true,
//     });

//     const keyValuePair = mappedData.reduce((acc, item) => {
//       acc[item.key] = item.value;
//       return acc;
//     }, {});

//     // Update Task with New Index
//     await task.update({ currentIndex });

//     // Read Error File and Group Data (Optimize JSON Parsing)
//     const errorJsonFile = await readCSVAndConvertToJSON(errorFilePath);
//     const groupedData = groupByPrimaryKey(errorJsonFile);
//     const PrimaryValue = groupedData[currentIndex - 1]["PRIMARY"];
//     const Primary_key = groupedData[currentIndex - 1]["PRIMARY_KEY"];
//     // Stream CSV Processing
//     const absoluteFilePath = path.resolve(csvFilePath);
//     // let rowIndex = minIndex;
//     let filteredResult = null;

//     const csvStream = fs.createReadStream(absoluteFilePath).pipe(csv());

//     for await (const row of csvStream) {
//       // row.rowIndex = rowIndex++;
//       if (row[Primary_key] === PrimaryValue) {
//         filteredResult = row;
//         break;
//       }
    
//     }

//     // Handle Image Path Processing Efficiently
//     let imageFile = path.join(
//       __dirname,
//       "../../extractedFiles",
//       imageDirectoryPath
//     );
   
//     const relativeImagePath = imageFile.split("extractedFiles\\")[1];
//     res.status(200).json({
//       message: "Data found",
//       data: {
//         previousData: groupedData[currentIndex - 1],
//         max: maxIndex,
//         min: minIndex,
//         filteredResults: filteredResult,
//         imageDirectoryPath: relativeImagePath,
//         mappedReponse: keyValuePair,
//       },
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };


const getCsvCompareData = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { currentIndex } = req.body;

    if (currentIndex === undefined || currentIndex === null) {
      return res.status(400).json({ message: "Current index is required" });
    }

    // Fetch Task and Validations
    const task = await Assigndata.findOne({ where: { id: taskId } });
    if (!task) return res.status(404).json({ message: "Task not found" });

    const { max, min, templeteId, errorFilePath, csvFilePath, imageDirectoryPath } = task;
    const minIndex = Number(min),
      maxIndex = Number(max);

    if (Number.isNaN(minIndex) || Number.isNaN(maxIndex) || !csvFilePath) {
      return res.status(400).json({ message: "Invalid task data" });
    }

    if (currentIndex < minIndex || currentIndex > maxIndex) {
      return res.status(400).json({ message: "Invalid current index" });
    }

    // Load Mapped Data & Error File in Parallel
    const [mappedData, errorJsonFile] = await Promise.all([
      MappedData.findAll({
        where: { templeteId },
        attributes: ["key", "value"],
        raw: true,
      }),
      readCSVAndConvertToJSON(errorFilePath),
    ]);

    const keyValuePair = mappedData.reduce((acc, { key, value }) => {
      acc[key] = value;
      return acc;
    }, {});

    const groupedData = groupByPrimaryKey(errorJsonFile);
    const currentData = groupedData[currentIndex - 1] || {};
    const { PRIMARY: primaryValue, PRIMARY_KEY: primaryKey } = currentData;

    if (!primaryValue || !primaryKey) {
      return res.status(400).json({ message: "Primary key or value missing" });
    }

    // **FAST DATA RETRIEVAL FROM CACHE (O(1) Lookup)**
    if (!csvCache) await loadCsvIntoMemory(csvFilePath,primaryKey); // Load CSV if not already cached
    // console.log(csvCache)
    const filteredResult = csvCache[primaryValue] || null;

    // Construct Image Pathcd 
    const imageFile = path.join(__dirname, "../../extractedFiles", imageDirectoryPath);
    const relativeImagePath = imageFile.split("extractedFiles\\")[1];
    resetCacheTimer();
    res.status(200).json({
      message: "Data found",
      data: {
        previousData: currentData,
        max: maxIndex,
        min: minIndex,
        filteredResults: filteredResult,
        imageDirectoryPath: relativeImagePath,
        mappedReponse: keyValuePair,
      },
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


module.exports = getCsvCompareData;
