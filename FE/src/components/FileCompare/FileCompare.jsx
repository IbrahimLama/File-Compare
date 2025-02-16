import React, { useState } from "react";
import * as XLSX from "xlsx";
import styles from "./FileCompare.module.css";

const FileCompare = () => {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [differences, setDifferences] = useState({});
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (event, fileSetter) => {
    fileSetter(event.target.files[0]);
  };

  const parseExcel = async (file) => {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });

    const sheetsData = {};
    workbook.SheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      sheetsData[sheetName] = XLSX.utils.sheet_to_json(worksheet);
    });

    return sheetsData;
  };

  const findDifferences = (sheets1, sheets2) => {
    const allSheetNames = new Set([...Object.keys(sheets1), ...Object.keys(sheets2)]);
    const differences = {};
  
    allSheetNames.forEach((sheet) => {
      const sheet1 = sheets1[sheet] || [];
      const sheet2 = sheets2[sheet] || [];
  
      if (!sheets1[sheet]) {
        differences[sheet] = [{ row: "-", status: "Sheet added in File 2" }];
        return;
      }
      if (!sheets2[sheet]) {
        differences[sheet] = [{ row: "-", status: "Sheet removed in File 2" }];
        return;
      }
  
      // Convert rows to JSON strings for easy comparison
      const set1 = new Map(sheet1.map((row, index) => [JSON.stringify(row), index + 1]));
      const set2 = new Map(sheet2.map((row, index) => [JSON.stringify(row), index + 1]));
  
      const addedRows = sheet2
        .map((row, index) => (!set1.has(JSON.stringify(row)) ? { row: index + 1, differences: row, status: "added" } : null))
        .filter(Boolean);
  
      const deletedRows = sheet1
        .map((row, index) => (!set2.has(JSON.stringify(row)) ? { row: index + 1, differences: row, status: "deleted" } : null))
        .filter(Boolean);
  
      const modifiedRows = [];
      const remainingSheet1 = sheet1.filter((row) => !deletedRows.some((del) => JSON.stringify(del.differences) === JSON.stringify(row)));
      const remainingSheet2 = sheet2.filter((row) => !addedRows.some((add) => JSON.stringify(add.differences) === JSON.stringify(row)));
  
      remainingSheet1.forEach((row1, index) => {
        const row2 = remainingSheet2[index] || {};
        const rowDiff = {};
  
        Object.keys({ ...row1, ...row2 }).forEach((key) => {
          if (row1[key] !== row2[key]) {
            rowDiff[key] = { file1: row1[key] || "", file2: row2[key] || "" };
          }
        });
  
        if (Object.keys(rowDiff).length > 0) {
          modifiedRows.push({ row: index + 1, differences: rowDiff, status: "modified" });
        }
      });
  
      differences[sheet] = [...deletedRows, ...addedRows, ...modifiedRows];
    });
  
    return differences;
  };
  
  const handleCompare = async () => {
    if (file1 && file2) {
      setIsLoading(true);
      try {
        const [sheets1, sheets2] = await Promise.all([parseExcel(file1), parseExcel(file2)]);
        const diffs = findDifferences(sheets1, sheets2);
        setDifferences(diffs);
        setSelectedSheet(Object.keys(diffs)[0] || null); // Select first sheet automatically
      } catch (error) {
        console.error("Error during comparison:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className={styles.container}>
      <h2>Excel Sheet Comparison</h2>
      <div className={styles.uploadSection}>
        <div>
          <label htmlFor="file1">Upload First Excel File:</label>
          <input type="file" id="file1" accept=".xlsx, .xls" onChange={(e) => handleFileUpload(e, setFile1)} />
        </div>
        <div>
          <label htmlFor="file2">Upload Second Excel File:</label>
          <input type="file" id="file2" accept=".xlsx, .xls" onChange={(e) => handleFileUpload(e, setFile2)} />
        </div>
        <button onClick={handleCompare} disabled={isLoading}>
          {isLoading ? "Processing..." : "Compare Sheets"}
        </button>
      </div>

      {isLoading && <p className={styles.loader}>Comparing files, please wait...</p>}

      {Object.keys(differences).length > 0 && (
        <div className={styles.result}>
          <h3>Differences Found:</h3>

          {/* Tab Navigation */}
          <div className={styles.tabs}>
            {Object.keys(differences).map((sheetName) => (
              <button
                key={sheetName}
                className={`${styles.tab} ${selectedSheet === sheetName ? styles.activeTab : ""}`}
                onClick={() => setSelectedSheet(sheetName)}
              >
                {sheetName}
              </button>
            ))}
          </div>

          {/* Display differences for the selected sheet */}
          {selectedSheet && (
            <div className={styles.sheetResult}>
              <h4>Sheet: {selectedSheet}</h4>
              {differences[selectedSheet].length === 1 && differences[selectedSheet][0].status ? (
                <p>{differences[selectedSheet][0].status}</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Row</th>
                      <th>Status</th>
                      <th>Column</th>
                      <th>File 1 Value</th>
                      <th>File 2 Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {differences[selectedSheet].map((diff, index) =>
                      diff.status === "modified" ? (
                        Object.entries(diff.differences).map(([key, value]) => (
                          <tr key={`${diff.row}-${key}`} className={styles.modifiedRow}>
                            <td>{diff.row}</td>
                            <td>{diff.status}</td>
                            <td>{key}</td>
                            <td>{value.file1}</td>
                            <td>{value.file2}</td>
                          </tr>
                        ))
                      ) : (
                        <tr key={index} className={diff.status === "deleted" ? styles.deletedRow : styles.addedRow}>
                          <td>-</td>
                          <td>{diff.status}</td>
                          <td>-</td>
                          <td>{JSON.stringify(diff.differences)}</td>
                          <td>-</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileCompare;
