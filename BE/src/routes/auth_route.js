const express = require("express");
const AuthController = require("../controllers/auth_controller.js");

const router = express.Router();

router.post("/register", AuthController.registerUser);
router.post("/login", AuthController.loginUser);
router.post("/reset-password", AuthController.resetPassword);

module.exports = router;
