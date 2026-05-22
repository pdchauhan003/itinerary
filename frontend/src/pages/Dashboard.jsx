import { useState } from "react";
import api from "../api/axios";

export default function Dashboard() {
  const [title, setTitle] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleGenerate = async () => {
    if (!title || files.length === 0) {
      alert("Please enter title and upload files");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });
      formData.append("journeyTitle", title);
      const response = await api.post("/upload",formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          },
          withCredentials: true
        }
      );
      console.log(response.data);
      alert("Files uploaded successfully");

    }
    catch (error) {
      console.log(error);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white shadow-lg rounded-2xl p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center text-gray-800">
          Journey Dashboard
        </h1>
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Journey Title
          </label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter journey title..." className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        </div>
        {/* Files */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Files
          </label>
          <input type="file" multiple onChange={handleFileChange} className="w-full border p-2 rounded-lg bg-gray-50"/>
          {
            files.length > 0 && (
              <div className="mt-3 space-y-1">
                {
                  files.map((file, index) => (
                    <p key={index} className="text-sm text-green-600">
                      {file.name}
                    </p>
                  ))
                }
              </div>
            )
          }
          {
          files.map((file, index) => (
            <p key={index} className="text-sm text-green-600">
              {file.name} {" "}
              <span className="text-gray-500">
                ({file.type})
              </span>
            </p>
          ))
        }
        </div>

        {/* Button */}
        <button onClick={handleGenerate}disabled={loading}className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition">
          {
            loading ? "Uploading..." : "Generate Journey"
          }
        </button>
      </div>
    </div>
  );
}