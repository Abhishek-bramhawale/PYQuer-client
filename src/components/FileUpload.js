import React, { useState } from 'react';
import AnalysisResults from './AnalysisResults';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      alert('Please select a PDF file');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
    } else {
      alert('Please select a PDF file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a file first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // First upload the file
      const uploadResponse = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const uploadData = await uploadResponse.json();
      
      // Then analyze the uploaded file
      const analysisResponse = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId: uploadData.fileId,
          subject: uploadData.subject,
          year: uploadData.year
        }),
      });

      if (!analysisResponse.ok) {
        throw new Error('Analysis failed');
      }

      const analysisData = await analysisResponse.json();
      setAnalysis(analysisData.analysis);
      setFile(null);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'An error occurred during upload or analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFile = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent triggering the label click
    setFile(null);
    // Reset the file input
    const fileInput = document.getElementById('file');
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="upload-section">
      <h2>Upload Question Papers</h2>
      <form onSubmit={handleSubmit}>
        <div 
          className={`container ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file').click()}
          style={{ cursor: 'pointer' }}
        > 
          <div className="header"> 
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g id="SVGRepo_iconCarrier"> 
                <path d="M7 10V9C7 6.23858 9.23858 4 12 4C14.7614 4 17 6.23858 17 9V10C19.2091 10 21 11.7909 21 14C21 15.4806 20.1956 16.8084 19 17.5M7 10C4.79086 10 3 11.7909 3 14C3 15.4806 3.8044 16.8084 5 17.5M7 10C7.43285 10 7.84965 10.0688 8.24006 10.1959M12 12V21M12 12L15 15M12 12L9 15" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> 
              </g>
            </svg> 
            <p>{isDragging ? 'Drop your file here!' : 'Browse File to upload!'}</p>
          </div> 
          <div className="footer" onClick={(e) => e.stopPropagation()}> 
            <svg fill="#000000" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <g id="SVGRepo_iconCarrier">
                <path d="M15.331 6H8.5v20h15V14.154h-8.169z"></path>
                <path d="M18.153 6h-.009v5.342H23.5v-.002z"></path>
              </g>
            </svg> 
            <p>{file ? file.name : 'No file selected'}</p> 
            <div 
              className={`remove-icon ${file ? 'active' : ''}`} 
              onClick={handleRemoveFile}
              title={file ? 'Remove file' : ''}
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g id="SVGRepo_iconCarrier"> 
                  <path d="M5.16565 10.1534C5.07629 8.99181 5.99473 8 7.15975 8H16.8402C18.0053 8 18.9237 8.9918 18.8344 10.1534L18.142 19.1534C18.0619 20.1954 17.193 21 16.1479 21H7.85206C6.80699 21 5.93811 20.1954 5.85795 19.1534L5.16565 10.1534Z" stroke="currentColor" strokeWidth="2"></path> 
                  <path d="M19.5 5H4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"></path> 
                  <path d="M10 3C10 2.44772 10.4477 2 11 2H13C13.5523 2 14 2.44772 14 3V5H10V3Z" stroke="currentColor" strokeWidth="2"></path> 
                </g>
              </svg>
            </div>
          </div> 
          <input 
            id="file" 
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          {file && (
            <button type="submit" className="upload-btn" onClick={(e) => e.stopPropagation()}>
              Upload and Analyze
            </button>
          )}
        </div>
      </form>
      <AnalysisResults 
        analysis={analysis}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
};

export default FileUpload;
