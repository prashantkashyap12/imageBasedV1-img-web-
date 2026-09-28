const express = require("express");
const router = express.Router();

const {
  onCsvBackupHandler,
  onMysqlBackupHandler,
} = require("../controllers/Settings/Settings");
const authMiddleware = require("../middleware/authMiddleware");
const { getAllServerIPs } = require("../controllers/Settings/IpController");
const { changeServerIP } = require("../controllers/Settings/setServerIP");

router.post("/csvbackup", authMiddleware, onCsvBackupHandler);
router.post("/mysqlbackup", authMiddleware, onMysqlBackupHandler);
router.get("/get-device-ip", authMiddleware, getAllServerIPs);
router.post("/setIp", changeServerIP);
// router.get("/getCurrentIp",getcurrentIP)
module.exports = router;
