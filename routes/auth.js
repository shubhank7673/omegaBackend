const express = require("express");
const router = express.Router();
const authController = require("../controller/auth");

router.get("/login", authController.getLogin);
router.get("/signup", authController.getSignup);
router.get("/check",authController.check);
router.post("/login", authController.postLogin);
router.post("/signup", authController.postSignup);
router.post('/authstatus',authController.getAuthStatus);
module.exports = router;
