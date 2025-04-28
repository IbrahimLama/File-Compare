const fs = require("fs");
const path = require("path");
const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/upload_controller");
const multer = require("multer");

const uploadDir = path.join(__dirname, "../../uploads");

// Ensure the uploads directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"));
  },
});

const upload = multer({ storage });

router.post("/", upload.array("files", 2), uploadController.uploadFiles);

module.exports = router;
