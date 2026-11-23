import React, { useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const SECTION_TITLES = [
  '1. Repeated Questions Analysis',
  '2. Questions Asking for Differences',
  '3. Questions Requiring Diagrams',
  '4. Remaining Questions',
  '5. Study Recommendations',
  '6. Predictions',
];

const SECTION_NAV = [
  { id: 'section-1', label: '1. Repeated' },
  { id: 'section-2', label: '2. Differences' },
  { id: 'section-3', label: '3. Diagrams' },
  { id: 'section-4', label: '4. Remaining' },
  { id: 'section-5', label: '5. Study' },
  { id: 'section-6', label: '6. Predictions' },
];

const normalizeHeadingLine = (line) =>
  String(line || '')
    .replace(/^#{1,6}\s*/, '')
    .replace(/\*\*/g, '')
    .trim()
    .replace(/:+\s*$/, '');

const matchSectionTitle = (line) => {
  const normalized = normalizeHeadingLine(line);
  return SECTION_TITLES.find(
    (title) => normalized === title || normalized.startsWith(`${title}`)
  ) || null;
};

const parseTableFromSectionContent = (content, section) => {
  if (!content || typeof content !== 'string') {
    return [];
  }

  try {
    const cleaned = content.replace(/^---+?\s*/gm, '').trim();
    if (!cleaned) return [];

    if (/^No\s+.+\s+found/i.test(cleaned) && !cleaned.includes('|')) {
      return { isEmpty: true, message: cleaned.split(/\n+/)[0].trim() };
    }

    const lines = cleaned.split(/\r?\n/);
    const headerIndex = lines.findIndex(
      (line) => line.includes('|') && !/^\s*\|?[\s:-]+\|/.test(line)
    );
    if (headerIndex === -1) {
      return { isEmpty: true, message: cleaned.split(/\n+/)[0].trim() || cleaned };
    }

    const rows = [];
    for (let i = headerIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        if (rows.length) break;
        continue;
      }
      if (/^---+/.test(line)) break;
      if (/^\|?[\s:-]+\|/.test(line)) continue;
      if (!line.includes('|')) {
        if (rows.length) break;
        continue;
      }

      const cells = line
        .split('|')
        .map((cell) => cell.trim())
        .filter((cell, idx, arr) => !(idx === 0 && cell === '') && !(idx === arr.length - 1 && cell === ''));

      if (section === '1. Repeated Questions Analysis') {
        if (cells.length >= 3) {
          rows.push({
            question: cells[0] || '',
            repeatedcount: cells[1] || '',
            papersappeared: cells[2] || '',
          });
        } else if (cells.length === 2) {
          rows.push({
            question: cells[0] || '',
            repeatedcount: '',
            papersappeared: cells[1] || '',
          });
        }
      } else if (cells.length >= 2) {
        rows.push({
          question: cells[0] || '',
          papersappeared: cells[1] || '',
        });
      }
    }

    if (!rows.length) {
      return { isEmpty: true, message: cleaned.split(/\n+/)[0].trim() || 'No data found' };
    }
    return rows;
  } catch (error) {
    console.error(`Error parsing table for section ${section}:`, error);
    return [];
  }
};

const parseSections = (text) => {
  const sections = {};
  let currentSection = '';
  let currentContent = [];
  const lines = String(text || '').split(/\r?\n/);

  for (const line of lines) {
    const matchedTitle = matchSectionTitle(line);
    if (matchedTitle) {
      if (currentSection) {
        sections[currentSection] = currentContent.join('\n').trim();
      }
      currentSection = matchedTitle;
      currentContent = [];
      continue;
    }
    if (currentSection) currentContent.push(line);
  }

  if (currentSection) {
    sections[currentSection] = currentContent.join('\n').trim();
  }
  return sections;
};

const parseMarkdown = (text) => {
  if (!text || typeof text !== 'string') return '';

  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  html = html.replace(/^#{1,6}\s+/gm, '');
  html = html.replace(/^---+$/gm, '');
  html = html.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/^(\d+\.\s+[^:]+:)/gm, '<strong>$1</strong>');
  html = html.replace(/(Paper\s+\d+:)/gi, '<strong>$1</strong>');
  html = html.replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em>$1</em>');
  html = html.replace(/\n/g, '<br>');
  return html;
};

const splitRemainingByPaper = (text) => {
  if (!text || !text.trim()) return [];
  const parts = text.split(/(?=(?:\*\*)?Paper\s+\d+:?(?:\*\*)?)/i).filter((p) => p.trim());
  return parts.map((part, index) => {
    const titleMatch = part.match(/(?:\*\*)?(Paper\s+\d+):?(?:\*\*)?/i);
    const title = titleMatch ? titleMatch[1] : `Paper ${index + 1}`;
    const body = part.replace(/(?:\*\*)?Paper\s+\d+:?(?:\*\*)?/i, '').trim();
    return { title, body };
  });
};

const countQuestionsApprox = (text) => {
  if (!text) return 0;
  const matches = text.match(/(?:^|\n)\s*(?:Q\.?\s*\d+|[A-C]\)|\d+\.\s)/gi);
  return matches ? matches.length : 0;
};

const formatCountBadge = (value) => {
  const raw = String(value || '').trim();
  const num = parseInt(raw.replace(/[^\d]/g, ''), 10);
  if (!Number.isFinite(num) || num <= 0) return raw || '—';
  return String(num);
};

function PromptDialog({ open, onClose, prompt, rawText }) {
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && open) onClose();
    };
    if (open) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  React.useEffect(() => {
    if (!open) {
      setCopied(false);
      document.body.classList.remove('dialog-open');
      document.documentElement.classList.remove('dialog-open');
      return undefined;
    }
    document.body.classList.add('dialog-open');
    document.documentElement.classList.add('dialog-open');
    return () => {
      document.body.classList.remove('dialog-open');
      document.documentElement.classList.remove('dialog-open');
    };
  }, [open]);

  if (!open) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      setCopied(false);
    }
  };

  return (
    <div className="ai-dialog-backdrop">
      <div className="ai-dialog-modal glass-card">
        <h2 className="ai-dialog-title light-heading">Try this prompt on ChatGPT or DeepSeek</h2>
        <div className="ai-dialog-desc">
          The following prompt already includes extracted text from all uploaded PDFs. Just copy it from here and paste it into any other AI platform.
        </div>
        <textarea value={prompt} readOnly className="ai-dialog-textarea" />
        <div className="ai-dialog-actions">
          <button className="aibutton" onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy Prompt'}
          </button>
          <a
            className="aibutton aibutton-secondary"
            href="https://chatgpt.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open ChatGPT
          </a>
          <a
            className="aibutton aibutton-secondary"
            href="https://chat.deepseek.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open DeepSeek
          </a>
        </div>
        <h3 className="ai-dialog-rawtitle light-heading">Raw Text from PDF</h3>
        <div className="ai-dialog-rawbox">{rawText}</div>
        <button className="ai-dialog-close" onClick={onClose} aria-label="Close dialog">
          &times;
        </button>
        <button className="ai-dialog-close-mobile" onClick={onClose} aria-label="Close dialog">
          Close
        </button>
      </div>
    </div>
  );
}

const AnalysisResults = ({ analysis, isLoading, error, papersText, promptTemplate, model }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expandedPapers, setExpandedPapers] = useState({});

  const parsed = useMemo(() => {
    if (!analysis?.analysis) return null;
    const sections = parseSections(analysis.analysis);
    const repeatedQuestions = parseTableFromSectionContent(
      sections['1. Repeated Questions Analysis'],
      '1. Repeated Questions Analysis'
    );
    const differenceQuestions = parseTableFromSectionContent(
      sections['2. Questions Asking for Differences'],
      '2. Questions Asking for Differences'
    );
    const diagramQuestions = parseTableFromSectionContent(
      sections['3. Questions Requiring Diagrams'],
      '3. Questions Requiring Diagrams'
    );
    const questionWiseAnalysis = sections['4. Remaining Questions'] || '';
    const studyRecommendations = sections['5. Study Recommendations'] || '';
    const predictions = sections['6. Predictions'] || '';
    const paperBlocks = splitRemainingByPaper(questionWiseAnalysis);

    return {
      repeatedQuestions,
      differenceQuestions,
      diagramQuestions,
      questionWiseAnalysis,
      studyRecommendations,
      predictions,
      paperBlocks,
    };
  }, [analysis]);

  if (!analysis || !analysis.analysis || !parsed) {
    return null;
  }

  const {
    repeatedQuestions,
    differenceQuestions,
    diagramQuestions,
    questionWiseAnalysis,
    studyRecommendations,
    predictions,
    paperBlocks,
  } = parsed;

  const paperCount = analysis.papers?.length || paperBlocks.length || 0;
  const repeatedCount = Array.isArray(repeatedQuestions) ? repeatedQuestions.length : 0;
  const diagramCount = Array.isArray(diagramQuestions) ? diagramQuestions.length : 0;
  const differenceCount = Array.isArray(differenceQuestions) ? differenceQuestions.length : 0;
  const questionCount =
    countQuestionsApprox(questionWiseAnalysis) +
    repeatedCount +
    diagramCount +
    differenceCount;

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFont('helvetica');
    doc.setFontSize(16);
    doc.text('Analysis Results', 20, 20);
    doc.setFontSize(12);

    let yPosition = 40;
    const lineHeight = 7;
    const pageHeight = 280;
    const margin = 20;

    const addWrappedText = (text, x, y, maxWidth) => {
      const lines = doc.splitTextToSize(text, maxWidth);
      for (let i = 0; i < lines.length; i++) {
        if (y + lineHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(lines[i], x, y);
        y += lineHeight;
      }
      return y + 5;
    };

    const addSection = (title, content) => {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor('red');
      yPosition = addWrappedText(title, margin, yPosition, 160);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor('black');
      yPosition = addWrappedText(content, margin, yPosition, 160);
      yPosition += 10;
    };

    addSection(
      '1. Repeated Questions Analysis',
      repeatedQuestions.isEmpty
        ? repeatedQuestions.message
        : repeatedQuestions
            .map((q) => `• ${q.question} (${q.repeatedcount} times, Papers: ${q.papersappeared})`)
            .join('\n')
    );
    addSection(
      '2. Questions Asking for Differences',
      differenceQuestions.isEmpty
        ? differenceQuestions.message
        : differenceQuestions.map((q) => `• ${q.question} (Papers: ${q.papersappeared})`).join('\n')
    );
    addSection(
      '3. Questions Requiring Diagrams',
      diagramQuestions.isEmpty
        ? diagramQuestions.message
        : diagramQuestions.map((q) => `• ${q.question} (Papers: ${q.papersappeared})`).join('\n')
    );
    addSection('4. Remaining Questions', questionWiseAnalysis);
    addSection('5. Study Recommendations', studyRecommendations);
    addSection('6. Predictions', predictions);

    doc.setFontSize(15);
    doc.setFont('Times New Roman', 'italic');
    doc.setTextColor('blue');
    yPosition += 10;
    if (yPosition > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
    doc.text('All the best for your exams!!', margin, yPosition);

    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    doc.save(`analysis_results_${timestamp}.pdf`);
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const togglePaper = (title) => {
    setExpandedPapers((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const renderTableSection = (id, title, data, columns) => {
    if (!data || data.isEmpty || (Array.isArray(data) && data.length === 0)) {
      return (
        <div id={id} className="analysis-section glass-card">
          <h2 className="section-title light-heading">{title}</h2>
          <div className="empty-message">{data?.message || 'No data available'}</div>
        </div>
      );
    }

    return (
      <div id={id} className="analysis-section glass-card">
        <h2 className="section-title light-heading">{title}</h2>
        <div className="table-container">
          <table className={`analysis-table ${columns.length === 2 ? 'two-columns' : ''}`}>
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index}>
                  {columns.map((col) => {
                    const key = col.toLowerCase().replace(/\s+/g, '');
                    const value = row[key] || '';
                    if (col === 'Repeated Count') {
                      return (
                        <td key={col}>
                          <span className="repeat-count-badge">{formatCountBadge(value)}</span>
                        </td>
                      );
                    }
                    return <td key={col}>{value}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="analysis-container">
      <div className="analysis-toolbar glass-card">
        <div className="analysis-summary">
          <span>{paperCount} papers</span>
          <span>·</span>
          <span>{questionCount || '—'} questions</span>
          <span>·</span>
          <span>{repeatedCount} repeated</span>
          <span>·</span>
          <span>{diagramCount} diagrams</span>
        </div>
        <div className="analysis-toolbar-actions">
          <button onClick={downloadPDF} className="download-pdf-btn">
            <FileDownloadIcon style={{ fontSize: '20px' }} />
            Download PDF
          </button>
          {papersText && promptTemplate && (
            <button className="try-other-ai-btn" onClick={() => setDialogOpen(true)}>
              <OpenInNewIcon style={{ fontSize: '18px' }} />
              Try on ChatGPT / DeepSeek
            </button>
          )}
        </div>
      </div>

      <nav className="analysis-sticky-nav" aria-label="Analysis sections">
        {SECTION_NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            className="analysis-nav-tab"
            onClick={() => scrollToSection(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {renderTableSection(
        'section-1',
        '1. Repeated Questions Analysis',
        repeatedQuestions,
        ['Question', 'Repeated Count', 'Papers Appeared']
      )}
      {renderTableSection(
        'section-2',
        '2. Questions Asking for Differences',
        differenceQuestions,
        ['Question', 'Papers Appeared']
      )}
      {renderTableSection(
        'section-3',
        '3. Questions Requiring Diagrams',
        diagramQuestions,
        ['Question', 'Papers Appeared']
      )}

      <div id="section-4" className="analysis-section glass-card">
        <h2 className="section-title light-heading">4. Remaining Questions</h2>
        {paperBlocks.length === 0 ? (
          <div className="empty-message">No remaining questions</div>
        ) : (
          <div className="paper-accordion">
            {paperBlocks.map(({ title, body }) => {
              const isOpen = expandedPapers[title] ?? false;
              return (
                <div key={title} className="paper-accordion-item">
                  <button
                    type="button"
                    className="paper-accordion-header"
                    onClick={() => togglePaper(title)}
                  >
                    <span>{title}</span>
                    {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </button>
                  {isOpen && (
                    <div
                      className="question-text"
                      dangerouslySetInnerHTML={{ __html: parseMarkdown(body) }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div id="section-5" className="analysis-section glass-card">
        <h2 className="section-title light-heading">5. Study Recommendations</h2>
        <div
          className="question-text"
          dangerouslySetInnerHTML={{ __html: parseMarkdown(studyRecommendations) }}
        />
      </div>

      <div id="section-6" className="analysis-section glass-card">
        <h2 className="section-title light-heading">6. Predictions</h2>
        <div
          className="question-text"
          dangerouslySetInnerHTML={{ __html: parseMarkdown(predictions) }}
        />
      </div>

      <PromptDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        prompt={promptTemplate}
        rawText={papersText}
      />
    </div>
  );
};

export default AnalysisResults;
