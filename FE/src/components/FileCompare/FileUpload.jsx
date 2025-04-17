import { useState } from "react";
import axios from "axios";

export default function FileUpload() {
  const [files, setFiles] = useState(null);
  const [message, setMessage] = useState("");
  const [differences, setDifferences] = useState(null);

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

    try {
      const response = await axios.post("http://localhost:3000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(response.data.message);
      compareFiles(response.data.file1, response.data.file2);
    } catch (error) {
      setMessage("Upload failed. Please try again.");
    }
  };

  const compareFiles = async (file1, file2) => {
    try {
      const response = await axios.get("http://localhost:3000/compare", {
        params: { file1, file2 },
      });
      setDifferences(response.data.differences);
      setMessage(response.data.message);
    } catch (error) {
      setMessage("Comparison failed. Please try again.");
    }
  };

  return (
    <div className="p-4 border rounded-md shadow-md max-w-md mx-auto">
      <h2 className="text-lg font-semibold mb-2">Upload and Compare Files</h2>
      <input type="file" multiple onChange={handleFileChange} className="mb-2" />
      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
      >
        Upload & Compare
      </button>
      {message && <p className="mt-2 text-sm text-gray-700">{message}</p>}
      {differences && (
        <div className="mt-4 p-2 border rounded-md bg-gray-100">
          <h3 className="text-md font-semibold">Differences:</h3>
          <ul className="text-sm text-gray-700">
            {differences.map((diff, index) => (
              <li key={index}>Line {diff.line}: {diff.diff1 || "(no change)"} → {diff.diff2 || "(no change)"}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
