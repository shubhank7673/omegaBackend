const express = require("express");
const router = express.Router();
const mainController = require("../controller/main");
const jwt = require("jsonwebtoken");
router.get("/test", mainController.test);
router.get("/filedownload/:filename", mainController.getDownload);
router.use((req, res, next) => {
  // console.log(req.headers);
  console.log("in");
  if (!req.headers.authorization) {
    return res.status(400).json({ error: true, message: "not authorized" });
  }
  var authorization = req.headers.authorization.split(" ")[1];
  var decoded = "";
  try {
    decoded = jwt.verify(authorization, "secret_private_key");
  } catch {
    res.json({ error: true, message: "unauthorized" });
  }
  const email = decoded.email;
  req.email = email;
  // console.log(req.email);
  next();
});
router.post("/changepassword", mainController.postPasswordChange);
router.post("/changename", mainController.postChangeUsername);
router.get("/getuser", mainController.getUser);
router.get("/privatedownload/:filename", mainController.getPrivateFileDownload);
router.get("/changefilestatus/:filename", mainController.getChangeFilestatus);
router.post("/filedelete", mainController.postDelete);
router.get("/fileupload", mainController.getFileUpload);
router.post("/getuserfiles", mainController.getUserFiles);
router.post("/fileupload", mainController.postFileUpload);
module.exports = router;
