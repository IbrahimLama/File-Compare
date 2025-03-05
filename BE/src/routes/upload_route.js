const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/upload_controller");
const multer = require("multer");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });

router.post("/", upload.array("files", 2), uploadController.uploadFiles);

module.exports = router;
