const fs = require("fs");

const uploadFiles = (req, res) => {
  if (!req.files || req.files.length !== 2) {
    return res.status(400).json({ error: "Please upload exactly two files." });
  }

  const file1Path = req.files[0].path;
  const file2Path = req.files[1].path;

  // Debugging: Check if files exist
  if (!fs.existsSync(file1Path) || !fs.existsSync(file2Path)) {
    return res
      .status(500)
      .json({ error: "File upload failed. Files not found." });
  }

  res.json({
    message: "Files uploaded successfully",
    file1: file1Path,
    file2: file2Path,
  });
};

module.exports = { uploadFiles };
