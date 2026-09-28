const multer = require("multer");
const fs = require("fs");
const path = require("path");
const unzipper = require('unzipper');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let destinationFolder = "COMPARECSV_FILES/" + "multipleCsvCompare";
        if (!fs.existsSync(destinationFolder)) {
            fs.mkdirSync(destinationFolder, { recursive: true });
        }
        cb(null, destinationFolder); // Destination folder
    },
    filename: function (req, file, cb) {

        cb(null, file.originalname); // Use original filename
    },
});

// Set up multer storage
const upload = multer({
    storage: storage,
    limits: undefined
}).fields([
    { name: "firstInputCsvFile", maxCount: 1 },
]);

const uploadCsv = async (req, res, next) => {
    // const userPermissions = req.permissions

    // if (!userPermissions.comparecsv) {
    //     return res.status(500).json({ message: "you dont have access for performing this action" })
    // }

    upload(req, res, async (err) => {
        const formatDate = (date) => {
            return date.toISOString().replace(/[:.]/g, '-'); // Replace colons and periods with dashes
        };
        if (err) {
            // Multer error occurred
            console.error("Multer error:", err);
            return res.status(400).json({ error: "Failed to upload file" });
        }

        // Access uploaded files using req.files
        const firstInputCsvFile = req.files["firstInputCsvFile"] ? req.files["firstInputCsvFile"][0] : null;
       
        req.uploadedFiles = {
            firstInputCsvFile,
            // secondInputCsvFile,
            // zipfileName,
            // omrImages
        };
        next();
    });
};

module.exports = uploadCsv;


