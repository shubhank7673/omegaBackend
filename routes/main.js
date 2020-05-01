const express = require("express");
const router = express.Router();
const mainController = require("../controller/main");

router.get("/fileupload", mainController.getFileUpload);
router.post("/fileupload", mainController.postFileUpload);
router.post("/filedownload", mainController.postDownload);
module.exports = router;
