const express = require("express");
const router = express.Router();
const compareController = require("../controllers/compare_controller");

router.get("/", compareController.compareFiles);

module.exports = router;
