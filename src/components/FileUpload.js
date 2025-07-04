import React, { useState, useEffect } from 'react';
import AnalysisResults from './AnalysisResults';
import { API_ENDPOINTS } from '../config/api';

const FileUpload = () => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isServerRunning, setIsServerRunning] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini');
  const [isUsingOCR, setIsUsingOCR] = useState(false);
  const [loadingLabelIndex, setLoadingLabelIndex] = useState(0);
  const loadingLabels = ['Analyzing...' ];
  const statusMessages = [
    'Reading PDF...',
    'Processing...',
    'Extracting text...',
    'Analyzing content...',
    'Summarizing info...',
    'Running models...',
    'Decoding input...',
    'Generating response...',
    'Structuring output...',
    'Almost there...',
    'Finalizing summary...'
  ];
  const [statusIndex, setStatusIndex] = useState(0);
  const [showOCRNotice, setShowOCRNotice] = useState(false);
  const [papersText, setPapersText] = useState('');
  const [showLongWait, setShowLongWait] = useState(false);

  useEffect(() => {
    const checkServer = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.HEALTH);
        setIsServerRunning(response.ok);
      } catch (error) {
        setIsServerRunning(false);
      }
    };

    checkServer();
    const interval = setInterval(checkServer, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let interval;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingLabelIndex(prev => (prev + 1) % loadingLabels.length);
      }, 2000);
    } else {
      setLoadingLabelIndex(0);
    }
    return () => interval && clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    let interval;
    if (isLoading) {
      interval = setInterval(() => {
        setStatusIndex(prev => (prev + 1) % statusMessages.length);
      }, 7000);
    } else {
      setStatusIndex(0);
    }
    return () => interval && clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    if (isUsingOCR) {
      setShowOCRNotice(true);
      const timer = setTimeout(() => setShowOCRNotice(false), 8000);
      return () => clearTimeout(timer);
    } else {
      setShowOCRNotice(false);
    }
  }, [isUsingOCR]);

  useEffect(() => {
    let timer;
    if (isLoading) {
      timer = setTimeout(() => setShowLongWait(true), 20000);
    } else {
      setShowLongWait(false);
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const pdfFiles = selectedFiles.filter(file => file.type === 'application/pdf');

    if (pdfFiles.length > 0) {
      setFiles(prevFiles => [...prevFiles, ...pdfFiles]);
    } else {
      alert('Please select PDF files');
    }
    e.target.value = null;
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
    const droppedFiles = Array.from(e.dataTransfer.files);
    const pdfFiles = droppedFiles.filter(file => file.type === 'application/pdf');

    if (pdfFiles.length > 0) {
      setFiles(prevFiles => [...prevFiles, ...pdfFiles]);
    } else {
      alert('Please drop PDF files');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      alert('Please select at least one file first');
      return;
    }

    if (!isServerRunning) {
      setError('Server is not running. Please make sure the backend server is started.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setIsUsingOCR(false);

    const formData = new FormData();
    files.forEach(fileItem => {
      formData.append('files', fileItem);
    });

    try {
      const healthCheck = await fetch(API_ENDPOINTS.HEALTH);
      if (!healthCheck.ok) {
        throw new Error('Server is not responding. Please make sure the backend server is running.');
      }

      const uploadResponse = await fetch(API_ENDPOINTS.UPLOAD, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Upload failed');
      }

      const uploadData = await uploadResponse.json();
      
      const anyPaperNeedsOCR = uploadData.files.some(uploadedFile => uploadedFile.needsOCR);
      if (anyPaperNeedsOCR) {
        setIsUsingOCR(true);
      } else {
        setIsUsingOCR(false);
      }

      const papersToAnalyze = uploadData.files.map(uploadedFile => ({
        fileId: uploadedFile.fileId,
        subject: uploadedFile.subject || 'Unknown Subject',
        year: uploadedFile.year || new Date().getFullYear(),
        originalName: uploadedFile.originalName, 
        needsOCR: uploadedFile.needsOCR
      }));

      const analysisEndpoint = API_ENDPOINTS.GEMINI.replace('/ai/gemini', '/analyze');
      const token = localStorage.getItem('token');
      const analysisResponse = await fetch(analysisEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ papers: papersToAnalyze, model: selectedModel }),
      });

      if (!analysisResponse.ok) {
        const errorData = await analysisResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Analysis failed');
      }

      const analysisData = await analysisResponse.json();
      
      console.log('papersText:', analysisData.papersText);
      console.log('prompt:', analysisData.prompt);
      console.log(`\n=== Raw Analysis Data from ${selectedModel.toUpperCase()} ===\n`);
      console.log(analysisData.analysis);
      console.log('\n=====================================\n');
      
      setAnalysis(analysisData);
      setFiles([]);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'An error occurred during upload or analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFile = (index) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const addSampleFiles = async () => {
    const sampleNames = ['computer_network1.pdf', 'computer_network2.pdf'];
    const files = await Promise.all(
      sampleNames.map(async (name) => {
        const response = await fetch(process.env.PUBLIC_URL + '/' + name);
        const blob = await response.blob();
        return new File([blob], name, { type: 'application/pdf' });
      })
    );
    setFiles(prevFiles => [...prevFiles, ...files]);
  };

  return (
    // <div className="gradient-bar">
    <div className="upload-section">
      
      <h2 className="animated-gradient-text">
        Turn PYQs into your study plan
      </h2>
      {!isServerRunning && (
        <div className="server-status error">
          <p>⚠️ Starting the server. just Please wait few seconds .</p>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div 
          className={`container fileupload-container${isDragging ? ' dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div
            className="header fileupload-header"
            onClick={() => document.getElementById('file-input').click()}
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g id="SVGRepo_iconCarrier"> 
                <path d="M7 10V9C7 6.23858 9.23858 4 12 4C14.7614 4 17 6.23858 17 9V10C19.2091 10 21 11.7909 21 14C21 15.4806 20.1956 16.8084 19 17.5M7 10C4.79086 10 3 11.7909 3 14C3 15.4806 3.8044 16.8084 5 17.5M7 10C7.43285 10 7.84965 10.0688 8.24006 10.1959M12 12V21M12 12L15 15M12 12L9 15" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> 
              </g>
            </svg> 
            <p>{isDragging ? 'Drop your files here!' : 'Drag & drop or Browse Files to upload!'}</p>
          </div>
          <div className="file-list fileupload-file-list" onClick={() => document.getElementById('file-input').click()}>
            {files.length === 0 ? (
              <div className="placeholder-file">
                <svg fill="#000000" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <g id="SVGRepo_iconCarrier">
                    <path d="M15.331 6H8.5v20h15V14.154h-8.169z"></path>
                    <path d="M18.153 6h-.009v5.342H23.5v-.002z"></path>
                  </g>
                </svg> 
                <p>No files selected</p> 
              </div>
            ) : (
              files.map((fileItem, index) => (
                <div key={index} className="uploaded-file-item fileupload-uploaded-file">
                  <svg fill="#000000" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    <g id="SVGRepo_iconCarrier">
                      <path d="M15.331 6H8.5v20h15V14.154h-8.169z"></path>
                      <path d="M18.153 6h-.009v5.342H23.5v-.002z"></path>
                    </g>
                  </svg> 
                  <p>{fileItem.name}</p> 
                  <div className="fileupload-file-actions">
                    <div
                      className="open-icon active fileupload-open-icon"
                      onClick={e => {
                        e.stopPropagation();
                        const url = URL.createObjectURL(fileItem);
                        window.open(url, '_blank', 'noopener,noreferrer');
                        setTimeout(() => URL.revokeObjectURL(url), 10000);
                      }}
                      title="Open file"
                    >
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="fileupload-open-icon-svg" >
                        <path d="M14 3H17V6" stroke="#540ac9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10 10L17 3" stroke="#540ac9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M17 10V17H3V3H10" stroke="#540ac9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div 
                      className="remove-icon active fileupload-remove-icon" 
                      onClick={handleRemoveFile(index)}
                      title="Remove file"
                    >
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g id="SVGRepo_iconCarrier"> 
                          <path d="M5.16565 10.1534C5.07629 8.99181 5.99473 8 7.15975 8H16.8402C18.0053 8 18.9237 8.9918 18.8344 10.1534L18.142 19.1534C18.0619 20.1954 17.193 21 16.1479 21H7.85206C6.80699 21 5.93811 20.1954 5.85795 19.1534L5.16565 10.1534Z" stroke="currentColor" strokeWidth="2"></path> 
                          <path d="M19.5 5H4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"></path> 
                        </g>
                      </svg>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <input
            type="file"
            id="file-input"
            multiple
            accept=".pdf"
            onChange={handleFileChange}
            className="fileupload-input-hidden"
          />
          <button 
            type="submit" 
            className="upload-button"
            disabled={files.length === 0 || !isServerRunning}
            onClick={(e) => e.stopPropagation()}
          >
            {isLoading ? loadingLabels[loadingLabelIndex] : 'Upload'}
          </button>
          {isLoading && (
            <div className="fileupload-loading">
              <video
                autoPlay
                loop
                muted
                className="fileupload-loading-video"
              >
                <source src="/animation.webm" type="video/webm" />
              </video>
              {showOCRNotice && (
                <p className="fileupload-ocr-notice">
                  Non-searchable PDF detected... performing OCR scanning... Just wait few seconds..
                </p>
              )}
              <p className="fileupload-status-message">
                {statusMessages[statusIndex]}
              </p>
            </div>
          )}
          {!isLoading && (
            <div className="ai-model-select-container">
              <span className="fileupload-model-label">AI Model:</span>
              <select 
                value={selectedModel} 
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={isLoading}
                className="ai-model-select"
              >
                <option value="gemini">Gemini</option>
                <option value="mistral">Mistral</option>
                {/* <option value="cohere">Cohere</option> */}
              </select>
            </div>
          )}
          {!isLoading && (
            <div className="add-sample-btn-container">
              <button
                type="button"
                onClick={addSampleFiles}
                className="add-sample-btn"
              >
                Add Sample pdfs
              </button>
            </div>
          )}
          {showLongWait && (
            <div className="long-wait-message" style={{ color: '#b45309', background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 6, padding: '12px 18px', margin: '18px 0', fontSize: 16, textAlign: 'center' }}>
              This is taking a little longer than usual... Possible reason must be Non-searchable PDF.. please wait a few more seconds (or try uploading searchable pdf for fast analysis) Multiple steps like OCR, AI analysis, and formatting are being performed to ensure accurate results. Thanks for your patience!!
            </div>
          )}
        </div>
      </form>

      <AnalysisResults 
        analysis={analysis}
        isLoading={isLoading}
        error={error}
        model={selectedModel}
        papersText={analysis?.papersText}
        promptTemplate={analysis?.prompt}
      />
    </div>
    // </div>
  );
};

export default FileUpload;
