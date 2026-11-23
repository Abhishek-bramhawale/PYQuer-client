import React, { useState, useEffect, useRef } from 'react';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import AnalysisResults from './AnalysisResults';
import Toast from './Toast';
import Features from './Features';
import SiteFooter from './SiteFooter';
import { API_ENDPOINTS } from '../config/api';
import geminiIcon from '../images/gemini.png';
import mistralIcon from '../images/mistral.png';

const formatFileSize = (bytes) => {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Main page — upload PDFs, send to server, show AI analysis
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
  const [showLongWait, setShowLongWait] = useState(false);
  const [toast, setToast] = useState({ message: null, type: 'warning' });
  const [providerHealth, setProviderHealth] = useState(null);
  const [providerHealthLoading, setProviderHealthLoading] = useState(true);
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const modelMenuRef = useRef(null);

  const isEnvFlagTrue = (value) => String(value || '').trim().toLowerCase() === 'true';

  const AI_MODEL_OPTIONS = [
    { id: 'gemini', label: 'Gemini', icon: geminiIcon },
    { id: 'mistral', label: 'Mistral', icon: mistralIcon },
    ...(isEnvFlagTrue(process.env.REACT_APP_SHOW_GROK)
      ? [{ id: 'grok', label: 'Grok', icon: null }]
      : []),
    ...(isEnvFlagTrue(process.env.REACT_APP_SHOW_OPENROUTER)
      ? [{ id: 'openrouter', label: 'OpenRouter Free', icon: null }]
      : []),
  ];

  const getModelStatusMeta = (id) => {
    if (providerHealthLoading || !providerHealth) {
      return { statusLabel: 'Checking...', statusClass: 'checking' };
    }
    const status = providerHealth[id]?.status;
    if (status === 'ready') return { statusLabel: 'Ready', statusClass: 'ready' };
    if (status === 'degraded') return { statusLabel: 'Degraded', statusClass: 'degraded' };
    if (status === 'unavailable') return { statusLabel: 'Unavailable', statusClass: 'unavailable' };
    return { statusLabel: '', statusClass: '' };
  };

  // Check if backend server is running when page loads
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
  }, []);

  useEffect(() => {
    if (!modelMenuOpen) return undefined;
    const handleOutside = (e) => {
      if (modelMenuRef.current && !modelMenuRef.current.contains(e.target)) {
        setModelMenuOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') setModelMenuOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [modelMenuOpen]);

  // Background AI provider health — refetch on every page load / refresh
  useEffect(() => {
    let cancelled = false;

    try {
      sessionStorage.removeItem('pyquer_ai_health');
    } catch (e) {
      // ignore
    }

    const fetchHealth = async () => {
      setProviderHealthLoading(true);
      try {
        const response = await fetch(`${API_ENDPOINTS.AI_HEALTH}?fresh=1`);
        if (!response.ok) throw new Error('Health request failed');
        const data = await response.json();
        if (cancelled) return;
        setProviderHealth(data?.providers || {});
        setProviderHealthLoading(false);
      } catch (error) {
        console.warn('AI provider health check failed:', error);
        if (!cancelled) {
          setProviderHealth({});
          setProviderHealthLoading(false);
        }
      }
    };

    fetchHealth();
    return () => {
      cancelled = true;
    };
  }, []);

  // Rotate "Analyzing..." text on upload button while loading
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
  }, [isLoading, loadingLabels.length]);

  // Cycle through status messages under the loading animation
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
  }, [isLoading, statusMessages.length]);

  // Show OCR notice for a few seconds when scanned PDF is detected
  useEffect(() => {
    if (isUsingOCR) {
      setShowOCRNotice(true);
      const timer = setTimeout(() => setShowOCRNotice(false), 8000);
      return () => clearTimeout(timer);
    } else {
      setShowOCRNotice(false);
    }
  }, [isUsingOCR]);

  // Show "taking longer" message if analysis runs more than 20 seconds
  useEffect(() => {
    let timer;
    if (isLoading) {
      timer = setTimeout(() => setShowLongWait(true), 20000);
    } else {
      setShowLongWait(false);
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

  // Add PDFs when user picks files from file browser
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

  // Highlight drop zone when user drags files over it
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // Remove highlight when drag leaves the drop zone
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Add PDFs when user drops files onto the upload area
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

  // Upload PDFs to server, then request AI analysis
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      alert('Please select at least one file first');
      return;
    }

    if (checkForDuplicates(files)) {
      setToast({
        message: 'Duplicate file names detected. Please remove duplicates before uploading.',
        type: 'error'
      });
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
      const ANALYZE_TIMEOUT_MS = 2 * 60 * 1000;

      // One analyze attempt with a hard 2-minute timeout
      const requestAnalysis = async () => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), ANALYZE_TIMEOUT_MS);
        try {
          const analysisResponse = await fetch(analysisEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ papers: papersToAnalyze, model: selectedModel }),
            signal: controller.signal,
          });

          if (!analysisResponse.ok) {
            const errorData = await analysisResponse.json().catch(() => ({}));
            const apiError = new Error(errorData.error || 'Analysis failed');
            apiError.details = errorData.details;
            throw apiError;
          }

          return await analysisResponse.json();
        } catch (err) {
          if (err?.name === 'AbortError') {
            throw new Error('Analysis timed out after 2 minutes');
          }
          throw err;
        } finally {
          clearTimeout(timer);
        }
      };

      // Attempt once, then retry once with the same model on timeout/failure
      let analysisData = null;
      let lastAnalyzeError = null;
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          analysisData = await requestAnalysis();
          lastAnalyzeError = null;
          break;
        } catch (analyzeError) {
          lastAnalyzeError = analyzeError;
          console.warn(`Analyze attempt ${attempt} failed:`, analyzeError);
          if (attempt === 1) {
            setToast({
              message: 'Analysis failed or timed out. Retrying once with the same model...',
              type: 'warning',
            });
          }
        }
      }

      if (!analysisData) {
        throw lastAnalyzeError || new Error('Analysis failed');
      }

      console.log('papersText:', analysisData.papersText);
      console.log('prompt:', analysisData.prompt);
      console.log(`\n=== Raw Analysis Data from ${selectedModel.toUpperCase()} ===\n`);
      console.log(analysisData.analysis);
      console.log('\n=====================================\n');

      setAnalysis(analysisData);
      setFiles([]);
    } catch (error) {
      console.error('Error:', error);
      let toastMessage = error.message || 'An error occurred during upload or analysis';

      // Extract detailed error message from API response if available
      if (error.details) {
        try {
          const detailMatch = error.details.match(/"message":\s*"([^"]+)"/);
          if (detailMatch && detailMatch[1]) {
            toastMessage = detailMatch[1];
          }
        } catch (e) {
        }
      }

      setError(toastMessage);
      setToast({
        message: toastMessage,
        type: 'error'
      });

      // Show suggestion toast after a delay
      setTimeout(() => {
        setToast({
          message: 'Try using a different AI model for better results',
          type: 'warning'
        });
      }, 3500);
    } finally {
      setIsLoading(false);
    }
  };

  // Remove one file from the list before upload
  const handleRemoveFile = (index) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  // Return true if two or more files have the same name
  const checkForDuplicates = (fileList) => {
    const fileNames = fileList.map(file => file.name.toLowerCase());
    const duplicates = fileNames.filter((name, index) => fileNames.indexOf(name) !== index);
    return duplicates.length > 0;
  };

  // Load demo PDFs from public folder so user can try without own files
  const addSampleFiles = async () => {
    const sampleNames = ['computer_network1.pdf', 'computer_network2.pdf'];
    const newFiles = await Promise.all(
      sampleNames.map(async (name) => {
        const response = await fetch(process.env.PUBLIC_URL + '/' + name);
        const blob = await response.blob();
        return new File([blob], name, { type: 'application/pdf' });
      })
    );

    const existingFileNames = files.map(file => file.name.toLowerCase());
    const duplicateFiles = newFiles.filter(file => 
      existingFileNames.includes(file.name.toLowerCase())
    );

    if (duplicateFiles.length > 0) {
      setToast({
        message: 'Same files were uploaded multiple times',
        type: 'warning'
      });
      return;
    }

    setFiles(prevFiles => [...prevFiles, ...newFiles]);
  };

  const selectedStatus = getModelStatusMeta(selectedModel);

  return (
    <div className="upload-section">
      <h2 className="animated-gradient-text">
        Turn PYQs into your study plan
      </h2>
      <p className="upload-subtitle">
        Upload previous year question papers. Get repeated questions, patterns and predictions with AI.
      </p>
      {!isServerRunning && (
        <div className="server-status error">
          <p>starting Server, wait few seconds or Refresh!! .</p>
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
                <path d="M7 10V9C7 6.23858 9.23858 4 12 4C14.7614 4 17 6.23858 17 9V10C19.2091 10 21 11.7909 21 14C21 15.4806 20.1956 16.8084 19 17.5M7 10C4.79086 10 3 11.7909 3 14C3 15.4806 3.8044 16.8084 5 17.5M7 10C7.43285 10 7.84965 10.0688 8.24006 10.1959M12 12V21M12 12L15 15M12 12L9 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> 
              </g>
            </svg> 
            <p>{isDragging ? 'Drop your files here!' : 'Drag & drop or Browse Files to upload!'}</p>
          </div>
          <div className="file-list fileupload-file-list" onClick={() => document.getElementById('file-input').click()}>
            {files.length === 0 ? (
              <div className="placeholder-file">
                <PictureAsPdfOutlinedIcon />
                <p>No files selected</p> 
              </div>
            ) : (
              files.map((fileItem, index) => (
                <div key={index} className="uploaded-file-item fileupload-uploaded-file">
                  <PictureAsPdfOutlinedIcon className="fileupload-file-type-icon" />
                  <div className="fileupload-file-meta">
                    <p className="fileupload-file-name">{fileItem.name}</p>
                    <span className="fileupload-file-size">{formatFileSize(fileItem.size)}</span>
                  </div>
                  <div className="fileupload-file-actions">
                    <button
                      type="button"
                      className="fileupload-open-icon"
                      onClick={e => {
                        e.stopPropagation();
                        const url = URL.createObjectURL(fileItem);
                        window.open(url, '_blank', 'noopener,noreferrer');
                        setTimeout(() => URL.revokeObjectURL(url), 10000);
                      }}
                      title="Open file"
                      aria-label="Open file"
                    >
                      <OpenInNewOutlinedIcon />
                    </button>
                    <button
                      type="button"
                      className="fileupload-remove-icon"
                      onClick={handleRemoveFile(index)}
                      title="Remove file"
                      aria-label="Remove file"
                    >
                      <DeleteOutlineOutlinedIcon />
                    </button>
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
          {!isLoading && (
            <div className="upload-controls-row">
              <button
                type="button"
                onClick={addSampleFiles}
                className="add-sample-btn"
              >
                Try with sample PDFs
              </button>
              <div
                className={`ai-model-pill status-${selectedStatus.statusClass}`}
                ref={modelMenuRef}
              >
                <span className="fileupload-model-label">AI Model</span>
                <button
                  type="button"
                  className="ai-model-dropdown-trigger"
                  onClick={(e) => {
                    e.stopPropagation();
                    setModelMenuOpen((open) => !open);
                  }}
                  disabled={isLoading}
                  aria-haspopup="listbox"
                  aria-expanded={modelMenuOpen}
                >
                  {AI_MODEL_OPTIONS.find((opt) => opt.id === selectedModel)?.label || 'Gemini'}
                  <ExpandMoreIcon style={{ fontSize: 18 }} />
                </button>
                {selectedStatus.statusLabel && (
                  <span className={`model-status-chip ${selectedStatus.statusClass}`}>
                    {selectedStatus.statusLabel}
                  </span>
                )}
                {modelMenuOpen && (
                  <div className="ai-model-dropdown-menu" role="listbox">
                    {AI_MODEL_OPTIONS.map(({ id, label, icon }) => {
                      const meta = getModelStatusMeta(id);
                      return (
                        <button
                          key={id}
                          type="button"
                          role="option"
                          aria-selected={selectedModel === id}
                          className={`ai-model-dropdown-option${selectedModel === id ? ' active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedModel(id);
                            setModelMenuOpen(false);
                          }}
                        >
                          <span className="ai-model-option-left">
                            {icon ? (
                              <img src={icon} alt="" className="ai-model-option-icon" />
                            ) : (
                              <span className="ai-model-option-icon-fallback" aria-hidden="true" />
                            )}
                            <span>{label}</span>
                          </span>
                          {meta.statusLabel && (
                            <span className={`model-status-chip ${meta.statusClass}`}>
                              {meta.statusLabel}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
          <button 
            type="submit" 
            className="upload-button button button--pan"
            disabled={files.length === 0 || !isServerRunning}
            onClick={(e) => e.stopPropagation()}
          >
            <span>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 10V9C7 6.23858 9.23858 4 12 4C14.7614 4 17 6.23858 17 9V10C19.2091 10 21 11.7909 21 14C21 15.4806 20.1956 16.8084 19 17.5M7 10C4.79086 10 3 11.7909 3 14C3 15.4806 3.8044 16.8084 5 17.5M7 10C7.43285 10 7.84965 10.0688 8.24006 10.1959M12 12V21M12 12L15 15M12 12L9 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
              {isLoading ? loadingLabels[loadingLabelIndex] : 'Upload'}
            </span>
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
          {showLongWait && (
            <div className="long-wait-message">
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

      <Features />
      <SiteFooter />

      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: null, type: 'warning' })}
        />
      )}
    </div>
  );
};

export default FileUpload;
