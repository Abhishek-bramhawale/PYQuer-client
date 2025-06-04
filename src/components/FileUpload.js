import React, { useState } from 'react';

const FileUpload = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      alert('Please select a PDF file');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a file first');
      return;
    }
    // TODO: Handle file upload to server
    console.log('File to upload:', file);
  };

  return (
    <div className="upload-section">
      <h2>Upload Question Papers</h2>
      <div className="upload-container">
        <form onSubmit={handleSubmit}>
          <div className="file-input-container">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              id="file-upload"
              className="file-input"
            />
            <label htmlFor="file-upload" className="file-label">
              {file ? file.name : 'Choose PDF file'}
            </label>
          </div>
          <button type="submit" className="upload-btn">
            Analyze Paper
          </button>
        </form>
      </div>
    </div>
  );
};

export default FileUpload;
