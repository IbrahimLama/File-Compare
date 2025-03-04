const uploadFiles = (req, res) => {
    if (!req.files || req.files.length !== 2) {
        return res.status(400).json({ error: "Please upload exactly two files." });
    }

    const file1Path = req.files[0].path;
    const file2Path = req.files[1].path;

    res.json({ message: "Files uploaded successfully", file1: file1Path, file2: file2Path });
};

module.exports = { uploadFiles };