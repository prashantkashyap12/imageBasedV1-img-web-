const express = require("express");
const { mergeCSV } = require("../controllers/MergeCsv/mergecsv");
const {
  checkTempalte,
  getTableData,
  getTableHeaders,
} = require("../controllers/MergeCsv/checkTemplate");
const { checkDuplicates } = require("../controllers/MergeCsv/checkDuplicate");
const {
  viewDuplicates,
  getImageCol,
} = require("../controllers/MergeCsv/viewDuplicates");
const {
  deleteDuplicate,
  updateDuplicate,
} = require("../controllers/MergeCsv/updateDuplicate");
const {
  downloadCsvController,
} = require("../controllers/MergeCsv/downloadCsv");
const router = express.Router();

// router.post("/mergecsv", mergeCSV);
// router.post("/checkmergecsv", checkTempalte);
// router.get("/gettabledata/:templateId", getTableHeaders);

// router.post("/checkduplicates",checkDuplicates);
// router.post("/viewDuplicates",viewDuplicates);
// router.get("/getImageCol",getImageCol);
// router.put("/updateRow",updateDuplicate);
// router.delete("/deleteRow",deleteDuplicate);
// router.get("/downloadUpdatedCsv",downloadCsvController)

/**
 * @swagger
 * /mergecsv:
 *   post:
 *     summary: Merges CSV files
 *     description: This endpoint merges two or more CSV files based on the template.
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: body
 *         name: files
 *         description: The CSV files to merge.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             file1:
 *               type: string
 *               format: binary
 *             file2:
 *               type: string
 *               format: binary
 *     responses:
 *       200:
 *         description: CSV files merged successfully
 *       400:
 *         description: Invalid input
 */
router.post("/mergecsv", mergeCSV);

/**
 * @swagger
 * /checkmergecsv:
 *   post:
 *     summary: Checks the template before merging CSV
 *     description: Validates if the template can be applied to the CSV files before merging.
 *     responses:
 *       200:
 *         description: Template check successful
 *       400:
 *         description: Invalid template or CSV files
 */
router.post("/checkmergecsv", checkTempalte);

/**
 * @swagger
 * /gettabledata/{templateId}:
 *   get:
 *     summary: Retrieves table headers for a given template
 *     description: Fetches the headers for a table defined by the provided template ID.
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         description: The ID of the template.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Table headers retrieved successfully
 *       404:
 *         description: Template not found
 */
router.get("/gettabledata/:templateId", getTableHeaders);

/**
 * @swagger
 * /checkduplicates:
 *   post:
 *     summary: Checks for duplicate rows in the CSV
 *     description: This endpoint checks for duplicate rows in the provided CSV file.
 *     parameters:
 *       - in: body
 *         name: csvData
 *         description: The CSV data to check for duplicates.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             csvFile:
 *               type: string
 *               format: binary
 *     responses:
 *       200:
 *         description: Duplicates checked successfully
 *       400:
 *         description: Invalid CSV data
 */
router.post("/checkduplicates", checkDuplicates);

/**
 * @swagger
 * /viewDuplicates:
 *   post:
 *     summary: Views the duplicate entries in the CSV
 *     description: This endpoint displays duplicate rows found in the CSV file.
 *     responses:
 *       200:
 *         description: Duplicates displayed successfully
 *       404:
 *         description: No duplicates found
 */
router.post("/viewDuplicates", viewDuplicates);

/**
 * @swagger
 * /getImageCol:
 *   get:
 *     summary: Gets image columns for the CSV
 *     description: This endpoint retrieves image columns from the CSV template.
 *     responses:
 *       200:
 *         description: Image columns retrieved successfully
 *       404:
 *         description: No image columns found
 */
router.get("/getImageCol", getImageCol);

/**
 * @swagger
 * /updateRow:
 *   put:
 *     summary: Updates a row in the CSV
 *     description: This endpoint updates a specific row in the CSV based on user input.
 *     parameters:
 *       - in: body
 *         name: rowData
 *         description: The data to update in the row.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             rowId:
 *               type: integer
 *             newData:
 *               type: object
 *               properties:
 *                 column1:
 *                   type: string
 *                 column2:
 *                   type: string
 *     responses:
 *       200:
 *         description: Row updated successfully
 *       400:
 *         description: Invalid data
 */
router.put("/updateRow", updateDuplicate);

/**
 * @swagger
 * /deleteRow:
 *   delete:
 *     summary: Deletes a row from the CSV
 *     description: This endpoint deletes a row based on the provided row identifier.
 *     parameters:
 *       - in: body
 *         name: rowId
 *         description: The row ID to delete.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             rowId:
 *               type: integer
 *     responses:
 *       200:
 *         description: Row deleted successfully
 *       404:
 *         description: Row not found
 */
router.delete("/deleteRow", deleteDuplicate);

/**
 * @swagger
 * /downloadUpdatedCsv:
 *   get:
 *     summary: Downloads the updated CSV file
 *     description: This endpoint allows the user to download the updated CSV file.
 *     responses:
 *       200:
 *         description: CSV file downloaded successfully
 *       404:
 *         description: File not found
 */
router.get("/downloadUpdatedCsv", downloadCsvController);

module.exports = router;
