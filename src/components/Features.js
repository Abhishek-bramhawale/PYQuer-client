import React from 'react';
import DocumentScannerOutlinedIcon from '@mui/icons-material/DocumentScannerOutlined';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import MemoryOutlinedIcon from '@mui/icons-material/MemoryOutlined';

const FEATURES = [
  {
    title: 'OCR for scanned PDFs',
    description: 'Extracts text from scanned and searchable PDFs using Tesseract.js',
    Icon: DocumentScannerOutlinedIcon,
    color: '#a855f7',
  },
  {
    title: 'Repeated question detection',
    description: 'Finds questions that appear across multiple papers',
    Icon: SyncOutlinedIcon,
    color: '#ec4899',
  },
  {
    title: 'Diagram & difference questions',
    description: 'Separates questions that need diagrams or comparisons',
    Icon: AccountTreeOutlinedIcon,
    color: '#3b82f6',
  },
  {
    title: 'AI predictions',
    description: 'Predicts likely topics for your upcoming exam',
    Icon: AutoAwesomeOutlinedIcon,
    color: '#f59e0b',
  },
  {
    title: 'Export as PDF',
    description: 'Download the full analysis as a PDF for offline study',
    Icon: FileDownloadOutlinedIcon,
    color: '#22c55e',
  },
  {
    title: 'Choose Gemini or Mistral',
    description: 'Switch between AI models for your analysis',
    Icon: MemoryOutlinedIcon,
    color: '#06b6d4',
  },
];

const Features = () => (
  <section className="features-section" aria-labelledby="features-heading">
    <h2 id="features-heading" className="features-heading light-heading">Features</h2>
    <p className="features-subtext">
      Everything you need to turn past papers into a smart study plan
    </p>
    <div className="features-grid">
      {FEATURES.map(({ title, description, Icon, color }) => (
        <article key={title} className="feature-card">
          <div className="feature-card-top">
            <Icon className="feature-card-icon" style={{ color }} />
            <h3 className="feature-card-title">{title}</h3>
          </div>
          <p className="feature-card-desc">{description}</p>
        </article>
      ))}
    </div>
  </section>
);

export default Features;
