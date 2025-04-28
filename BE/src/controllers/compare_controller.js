const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const compareFiles = (req, res) => {
  const { file1, file2 } = req.query;

  if (!file1 || !file2) {
    return res
      .status(400)
      .json({ error: "Missing file paths in query parameters." });
  }

  const absPath1 = path.resolve(file1);
  const absPath2 = path.resolve(file2);

  console.log(absPath1, absPath2);
  exec(`diff ${absPath1} ${absPath2}`, (error, stdout, stderr) => {
    if (error && error.code !== 1) {
      return res.status(500).json({ error: `Error executing diff: ${stderr}` });
    }

    // Read full file contents to split into lines
    let file1Lines = [];
    let file2Lines = [];
    try {
      const file1Content = fs.readFileSync(absPath1, "utf8");
      const file2Content = fs.readFileSync(absPath2, "utf8");
      file1Lines = file1Content.split(/\r?\n/);
      file2Lines = file2Content.split(/\r?\n/);
    } catch (readError) {
      console.error(readError);
      return res.status(500).json({ error: "Error reading uploaded files." });
    }

    if (!stdout) {
      return res.json({
        file1Lines,
        file2Lines,
        differences: [],
        message: "No differences found.",
      });
    }

    const diffOutput = stdout.split("\n");
    const differences = [];
    let lineNumber1 = null;
    let lineNumber2 = null;

    for (let i = 0; i < diffOutput.length; i++) {
      const line = diffOutput[i];

      const match = line.match(/^(\d+)([acd])(\d+)$/);
      if (match) {
        lineNumber1 = match[1];
        lineNumber2 = match[3];
        continue;
      }

      if (line.startsWith("<")) {
        differences.push({
          line: lineNumber1,
          diff1: line.substring(2),
          diff2: null,
        });
      } else if (line.startsWith(">")) {
        differences.push({
          line: lineNumber2,
          diff1: null,
          diff2: line.substring(2),
        });
      }
    }

    return res.json({
      file1Lines,
      file2Lines,
      differences,
      message: "Comparison successful",
    });
  });
};

module.exports = { compareFiles };

