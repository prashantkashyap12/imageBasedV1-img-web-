const Files = require("../../models/TempleteModel/files");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const getCsvHeaderByTemplate = async (req, res, next) => {
  const { template_id } = req.params;

  const userRole = req.role;

  // if (userRole != "admin") {
  //     return res
  //         .status(500)
  //         .json({ message: "You don't have access for performing this action" });
  // }

  try {
    const fileData = await Files.findOne({
      where: { templeteId: template_id },
    });

    if (!fileData) {
      return res.status(200).json({ error: "File not found", data: [] });
    }

    const fileName = fileData.csvFile;
    const filePath = path.join(__dirname, "../../csvFile", fileName);

    if (!fs.existsSync(filePath)) {
      return res
        .status(404)
        .json({ error: "File not found on given filepath" });
    }

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, {
      raw: true,
      defval: "",
    });

    if (data.length === 0) {
      return res
        .status(404)
        .json({ error: "No content found in excel sheet", data: [] });
    }

    // Extract headers from the first row and trim spaces
    let headers = Object.keys(data[0]).map(header => header.trim());
    // let headers = Object.keys(data[0]).map((header) =>
    //   header.trim().replace(/\s+/g, ""),
    // );
    // console.log(headers)
    // Columns to remove
    const columnsToRemove = [
      "User Details",
      "Previous Values",
      "Updated Values",
      "Updated Col. Name",
    ];

    // Filter out unwanted headers
    headers = headers.filter((header) => !columnsToRemove.includes(header));

    // If all headers are removed, send an appropriate message
    if (headers.length === 0) {
      return res
        .status(400)
        .json({ error: "No valid headers found after filtering" });
    }
    // console.log(headers);

    res.status(200).json(headers);
  } catch (error) {
    console.error("Error in getCsvHeaderByTemplate:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = getCsvHeaderByTemplate;
