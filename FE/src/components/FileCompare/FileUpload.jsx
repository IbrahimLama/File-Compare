import { useState } from "react";
import axios from "axios";
import './FileCompare.module.css'; // Import your CSS file

export default function FileUpload() {
  const [files, setFiles] = useState(null);
  const [message, setMessage] = useState("");
  const [file1Lines, setFile1Lines] = useState([]);
  const [file2Lines, setFile2Lines] = useState([]);
  const [differences, setDifferences] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event) => {
    setFiles(event.target.files);
  };

  const handleUpload = async () => {
    if (!files || files.length !== 2) {
      setMessage("Please select exactly two files.");
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:3000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(response.data.message);
      await fetchComparison(response.data.file1, response.data.file2);
    } catch (error) {
      setMessage("Upload failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComparison = async (file1, file2) => {
    try {
      const response = await axios.get("http://localhost:3000/compare", {
        params: { file1, file2 },
      });
      setFile1Lines(response.data.file1Lines || []);
      setFile2Lines(response.data.file2Lines || []);
      setDifferences(response.data.differences || []);
    } catch (error) {
      setMessage("Comparison failed. Please try again.");
    }
  };

  const findDifferenceType = (index) => {
    const diff = differences.find(d => parseInt(d.line) === index + 1);

    if (!diff) return "same";
    if (diff.diff1 && diff.diff2) return "modified";
    if (diff.diff1 && !diff.diff2) return "deleted";
    if (!diff.diff1 && diff.diff2) return "added";

    return "same";
  };

  const renderComparison = () => {
    const maxLines = Math.max(file1Lines.length, file2Lines.length);

    return (
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>File 1</th>
              <th>Diff</th> {/* Arrow */}
              <th>#</th>
              <th>File 2</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: maxLines }, (_, index) => {
              const line1 = file1Lines[index] || "";
              const line2 = file2Lines[index] || "";
              const diffType = findDifferenceType(index);

              let leftClass = "";
              let rightClass = "";
              let arrow = "";

              if (diffType === "modified") {
                leftClass = "modified";
                rightClass = "modified";
                arrow = "➡️";
              } else if (diffType === "deleted") {
                leftClass = "deleted";
                rightClass = "";
                arrow = "❌";
              } else if (diffType === "added") {
                leftClass = "";
                rightClass = "added";
                arrow = "➕";
              }

              return (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td className={leftClass}>{line1}</td>
                  <td className="arrow">{arrow}</td>
                  <td>{index + 1}</td>
                  <td className={rightClass}>{line2}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="file-upload-container" style={{width:"100vw",height:"100vh",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center"}}>
      <h2>Upload and Compare Files</h2>
      <input type="file" multiple onChange={handleFileChange} />
      <button
        onClick={handleUpload}
        disabled={isLoading}
        className="upload-button"
      >
        {isLoading ? "Uploading..." : "Upload & Compare"}
      </button>
      {message && <p className={message.includes("failed") ? "message message-error" : "message message-success"}>{message}</p>}

      {file1Lines.length > 0 || file2Lines.length > 0 ? (
        renderComparison()
      ) : null}
    </div>
  );
}
