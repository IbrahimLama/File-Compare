import React, { useState } from "react";
import * as XLSX from "xlsx";
import styles from "./FileCompare.module.css";

const FileCompare = () => {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [differences, setDifferences] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (event, fileSetter) => {
    fileSetter(event.target.files[0]);
  };

  const parseExcel = async (file) => {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet);
  };

  const findDifferences = (sheet1, sheet2) => {
    const differences = [];
    const allKeys = new Set([
      ...sheet1.map((row) => Object.keys(row)).flat(),
      ...sheet2.map((row) => Object.keys(row)).flat(),
    ]);

    const maxLength = Math.max(sheet1.length, sheet2.length);

    for (let i = 0; i < maxLength; i++) {
      const row1 = sheet1[i] || {};
      const row2 = sheet2[i] || {};
      const rowDiff = {};

      allKeys.forEach((key) => {
        if (row1[key] !== row2[key]) {
          rowDiff[key] = { file1: row1[key] || "", file2: row2[key] || "" };
        }
      });

      if (Object.keys(rowDiff).length > 0) {
        differences.push({ row: i + 1, differences: rowDiff });
      }
    }

    return differences.sort((a, b) => a.row - b.row);
  };

  const handleCompare = async () => {
    if (file1 && file2) {
      setIsLoading(true); // Show loader
      try {
        const [sheet1, sheet2] = await Promise.all([
          parseExcel(file1),
          parseExcel(file2),
        ]);
        setDifferences(findDifferences(sheet1, sheet2));
      } catch (error) {
        console.error("Error during comparison:", error);
      } finally {
        setIsLoading(false); // Hide loader
      }
    }
  };

  const downloadDifferences = () => {
    const headers = ["Row", "Column", "File 1 Value", "File 2 Value"];
    const data = differences.flatMap((diff) =>
      Object.entries(diff.differences).map(([key, value]) => [
        diff.row,
        key,
        value.file1,
        value.file2,
      ])
    );

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Differences");
    XLSX.writeFile(workbook, "differences.xlsx");
  };
  console.log(differences)

  return (
    <div className={styles.container}>
      <h2>Excel Comparison</h2>
      <div className={styles.uploadSection}>
        <div>
          <label htmlFor="file1">Upload First Excel File:</label>
          <input
            type="file"
            id="file1"
            accept=".xlsx, .xls"
            onChange={(e) => handleFileUpload(e, setFile1)}
          />
        </div>
        <div>
          <label htmlFor="file2">Upload Second Excel File:</label>
          <input
            type="file"
            id="file2"
            accept=".xlsx, .xls"
            onChange={(e) => handleFileUpload(e, setFile2)}
          />
        </div>
        <button onClick={handleCompare} disabled={isLoading}>
          {isLoading ? "Processing..." : "Compare Sheets"}
        </button>
      </div>

      {isLoading && <p className={styles.loader}>Comparing files, please wait...</p>}

      {differences.length > 0 && (
        <div className={styles.result}>
          <h3>Differences Found:</h3>
          <table>
            <thead>
              <tr>
                <th>Row</th>
                <th>Column</th>
                <th>File 1 Value</th>
                <th>File 2 Value</th>
              </tr>
            </thead>
            <tbody>
              {differences.map((diff) =>
                Object.entries(diff.differences).map(([key, value]) => (
                  <tr key={`${diff.row}-${key}`}>
                    <td>{diff.row}</td>
                    <td>{key}</td>
                    <td>{value.file1}</td>
                    <td>{value.file2}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <button onClick={downloadDifferences}>Download Differences</button>
        </div>
      )}
    </div>
  );
};

export default FileCompare;
