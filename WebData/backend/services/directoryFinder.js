const fs = require("fs");
const path = require("path");

function getAllDirectories(directoryPath) {
  try {
    return fs
      .readdirSync(directoryPath, { withFileTypes: true }) // Efficiently get file metadata
      .filter((dirent) => dirent.isDirectory()) // Filter only directories
      .map((dirent) => dirent.name); // Return directory names only
  } catch (error) {
    console.error("Error reading directory:", error.message);
    return []; // Return empty array on error
  }
}

module.exports = getAllDirectories;
