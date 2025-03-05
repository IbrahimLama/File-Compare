const { exec } = require("child_process");
const path = require("path");

const compareFiles = (req, res) => {
    const { file1, file2 } = req.query;

    if (!file1 || !file2) {
        return res.status(400).json({ error: "Missing file paths in query parameters." });
    }

    const absPath1 = path.resolve(file1);
    const absPath2 = path.resolve(file2);

    exec(`diff ${absPath1} ${absPath2}`, (error, stdout, stderr) => {
        if (error && error.code !== 1) {
            return res.status(500).json({ error: `Error executing diff: ${stderr}` });
        }

        if (!stdout) {
            return res.json({ message: "No differences found." });
        }

        const diffOutput = stdout.split("\n");
        const differences = [];
        let lineNumber1 = null;
        let lineNumber2 = null;

        for (let i = 0; i < diffOutput.length; i++) {
            const line = diffOutput[i];

            // Check if line follows the pattern "number char number" (e.g., "6c7", "4d5", etc.)
            const match = line.match(/^(\d+)([acd])(\d+)$/);
            if (match) {
                lineNumber1 = match[1];
                lineNumber2 = match[3];
                continue;
            }

            if (line.startsWith("<")) {
                differences.push({ line: lineNumber1, diff1: line.substring(2), diff2: null });
            } else if (line.startsWith(">")) {
                differences.push({ line: lineNumber2, diff1: null, diff2: line.substring(2) });
            }
        }

        return res.json({ differences });
    });
};

module.exports = { compareFiles };
