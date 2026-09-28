const Files = require("../../models/TempleteModel/files");
const Template = require("../../models/TempleteModel/templete");
const Assigndata = require("../../models/TempleteModel/assigndata");
const sequelize = require("../../utils/database");
const { DataTypes, Op, QueryTypes } = require("sequelize");
const path = require("path");
const getAllDirectories = require("../../services/directoryFinder");

const duplicateDataExtractor = async (req, res) => {
    const { fileId, columnName, value } = req.body;
    try {
        if (!fileId) {
            return res.status(400).json({ error: "File ID not provided" });
        }

        const fileData = await Files.findByPk(fileId);
        if (!fileData || !fileData.csvFile) {
            return res.status(404).json({ error: "File not found" });
        }
        const { templeteId, startIndex, totalFiles,zipFile } = fileData;
        const lastIndex = startIndex + totalFiles;
        const template = await Template.findByPk(templeteId);
        const { csvTableName,imageColName } = template;

        const data = await sequelize.query(
            `SELECT * FROM ${csvTableName} WHERE \`${columnName}\` = :value AND id >= ${startIndex} AND id < ${lastIndex}`,
            { 
                type: QueryTypes.SELECT,
                replacements: { value }
            }
        );
        // const baseName = path.basename(data[imageColName]);
        const dirs = getAllDirectories(
          path.join(__dirname, "../", "../", "extractedFiles", zipFile)
        );
        const joinstr = dirs.join("/");
    
        const maindir = path.join(zipFile, joinstr);
        if (!data || data.length === 0) {
            return res.status(404).json({ error: "No matching data found" });
        }

        return res.status(200).json({success:true, data,imageUrl: maindir,imageColName });
    } catch (error) {
        console.error("Error processing CSV file:", error);
        return res.status(500).json({ error: "An error occurred while processing your request" });
    }
};

module.exports = duplicateDataExtractor;

