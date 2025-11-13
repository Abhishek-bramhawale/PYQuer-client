import React, { useState } from 'react';
import jsPDF from 'jspdf';

const parseMarkdownTable = (text, section) => {
  if (!text || typeof text !== 'string') {
    console.warn(`Invalid text provided for ${section}:`, text);
    return [];
  }
  
  try {
    const sectionRegex = new RegExp(`${section}:\\s*\\n([\\s\\S]*?)(?=\\n\\d\\.|$)`);
    const match = text.match(sectionRegex);
    
    if (!match || !match[1]) {
      console.warn(`No content found for section ${section}`);
      return [];
    }
    
    const content = match[1].trim();
    
    if (content.startsWith('No ') && content.includes('found')) {
      return { isEmpty: true, message: content };
    }
    
    const tableMatch = content.match(/\|.*\n\|[-|]+\n([\s\S]*?)(?=\n\d\.|$)/);
    if (!tableMatch) {
      return { isEmpty: true, message: content };
    }
    
    const tableContent = tableMatch[1].trim();
    if (!tableContent) {
      return { isEmpty: true, message: 'No data found' };
    }
    
    const lines = tableContent.split('\n');
    
    return lines.map(line => {
      if (!line || !line.trim()) return null;
      
      const cells = line.split('|')
        .filter(cell => cell && cell.trim())
        .map(cell => cell.trim());
      
      if (section === '1. Repeated Questions Analysis') {
        if (cells.length >= 3) {
          return {
            question: cells[0] || '',
            repeatedcount: cells[1] || '',
            papersappeared: cells[2] || ''
          };
        }
      } else {
        if (cells.length >= 2) {
          return {
            question: cells[0] || '',
            papersappeared: cells[1] || ''
          };
        }
      }
      return null;
    }).filter(Boolean);
  } catch (error) {
    console.error(`Error parsing table for section ${section}:`, error);
    return [];
  }
};

const parseSections = (text) => {
  const sections = {};
  const sectionTitles = [
    '1. Repeated Questions Analysis',
    '2. Questions Asking for Differences',
    '3. Questions Requiring Diagrams',
    '4. Remaining Questions',
    '5. Study Recommendations',
    '6. Predictions',
  ];

  let currentSection = '';
  let currentContent = [];

  const lines = text.split(/\r?\n/);

  for (const line of lines) {
    let isSectionTitle = false;
    for (const title of sectionTitles) {
      if (line.startsWith(title)) {
        if (currentSection) {
          sections[currentSection] = currentContent.join('\n').trim();
        }
        currentSection = title;
        currentContent = [];
        isSectionTitle = true;
        break;
      }
    }

    if (!isSectionTitle && currentSection) {
      currentContent.push(line);
    }
  }

  if (currentSection) {
    sections[currentSection] = currentContent.join('\n').trim();
  }
  return sections;
};

const AI_MODELS = [
  {
    name: 'Gemini',
    key: 'gemini',
    envKey: 'REACT_APP_GEMINI_API_KEY',
    endpoint: '/api/ai/gemini',
    color: '#4285F4',
  },
  
  {
    name: 'Cohere',
    key: 'cohere',
    envKey: 'REACT_APP_COHERE_API_KEY',
    endpoint: '/api/ai/cohere',
    color: '#FBBF24',
  },
  {
    name: 'Mistral',
    key: 'mistral',
    envKey: 'REACT_APP_MISTRAL_API_KEY',
    endpoint: '/api/ai/mistral',
    color: '#7C3AED',
  },
];

function PromptDialog({ open, onClose, prompt, rawText }) {
  if (!open) return null;
  return (
    <div className="ai-dialog-backdrop">
      <div className="ai-dialog-modal">
        <h2 className="ai-dialog-title">Try this prompt on ChatGPT or DeepSeek</h2>
        <div className="ai-dialog-desc">  The following prompt already includes extracted text from all uploaded PDFs. Just copy it from here and paste it into any other AI platform (no need to copy the PDF text manually).</div>
        <textarea
          value={prompt}
          readOnly
          className="ai-dialog-textarea"
        />
        <button className="aibutton"
          onClick={() => {navigator.clipboard.writeText(prompt)}}
        >Copy Prompt</button>
        <h3 className="ai-dialog-rawtitle">Raw Text from PDF</h3>
        <div className="ai-dialog-rawbox">{rawText}</div>
        <button
          className="ai-dialog-close"
          onClick={onClose}
          aria-label="Close dialog"
        >&times;</button>
        {/* Mobile close button below raw text */}
        <button
          className="ai-dialog-close-mobile"
          onClick={onClose}
          aria-label="Close dialog"
        >Close</button>
      </div>
    </div>
  );
}

const AnalysisResults = ({ analysis, isLoading, error, papersText, promptTemplate }) => {
  const selectedModel = AI_MODELS[0].key; 
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!analysis || !analysis.analysis) {
    return null;
  }

  const rawAnalysisText = analysis.analysis;
  const parsedSections = parseSections(rawAnalysisText);

  const repeatedQuestions = parseMarkdownTable(rawAnalysisText, '1. Repeated Questions Analysis');
  const differenceQuestions = parseMarkdownTable(rawAnalysisText, '2. Questions Asking for Differences');
  const diagramQuestions = parseMarkdownTable(rawAnalysisText, '3. Questions Requiring Diagrams');
  const questionWiseAnalysis = parsedSections['4. Remaining Questions'] || '';
  const studyRecommendations = parsedSections['5. Study Recommendations'] || '';
  const predictions = parsedSections['6. Predictions'] || '';

  //pdf
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
    
    addSection('1. Repeated Questions Analysis', 
      repeatedQuestions.isEmpty ? repeatedQuestions.message : 
      repeatedQuestions.map(q => `• ${q.question} (${q.repeatedcount} times, Papers: ${q.papersappeared})`).join('\n')
    );
    
    addSection('2. Questions Asking for Differences',
      differenceQuestions.isEmpty ? differenceQuestions.message :
      differenceQuestions.map(q => `• ${q.question} (Papers: ${q.papersappeared})`).join('\n')
    );
    
    addSection('3. Questions Requiring Diagrams',
      diagramQuestions.isEmpty ? diagramQuestions.message :
      diagramQuestions.map(q => `• ${q.question} (Papers: ${q.papersappeared})`).join('\n')
    );
    
    addSection('4. Remaining Questions', questionWiseAnalysis);
    addSection('5. Study Recommendations', studyRecommendations);
    addSection('6. Predictions', predictions);

    doc.setFontSize(15);
doc.setFont('Times New Roman', 'italic');
doc.setTextColor('blue');
yPosition = yPosition + 10; 

if (yPosition > pageHeight - margin) {
  doc.addPage();
  yPosition = margin;
}

doc.text('All the best for your exams!!', margin, yPosition);
    
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `analysis_results_${timestamp}.pdf`;
    
    doc.save(filename);
  };

  const renderTableSection = (title, data, columns) => {
    if (!data || data.isEmpty) {
      return (
        <div className="analysis-section">
          <h2 className="section-title">{title}</h2>
          <div className="empty-message">{data?.message || 'No data available'}</div>
        </div>
      );
    }

    return (
      <div className="analysis-section">
        <h2 className="section-title">{title}</h2>
        <div className="table-container">
          <table className={`analysis-table ${columns.length === 2 ? 'two-columns' : ''}`}>
            <thead>
              <tr>
                {columns.map((col, index) => (
                  <th key={index}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index}>
                  {columns.map((col) => (
                    <td key={col}>{row[col.toLowerCase().replace(/\s+/g, '').replace(' ', '')] || ''}</td>
                  ))}
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
      
      

      

    
      <div data-aos="fade-left" data-aos-anchor="#example-anchor" data-aos-offset="500" data-aos-duration="500">
        {renderTableSection('1. Repeated Questions Analysis', repeatedQuestions, ['Question', 'Repeated Count', 'Papers Appeared'])}
      </div>
     
      <div data-aos="fade-left" data-aos-anchor="#example-anchor" data-aos-offset="500" data-aos-duration="500">
        {renderTableSection('2. Questions Asking for Differences', differenceQuestions, ['Question', 'Papers Appeared'])}
      </div>
      <div data-aos="fade-left" data-aos-anchor="#example-anchor" data-aos-offset="500" data-aos-duration="500">
        {renderTableSection('3. Questions Requiring Diagrams', diagramQuestions, ['Question', 'Papers Appeared'])}
      </div>
      <div data-aos="fade-left" data-aos-anchor="#example-anchor" data-aos-offset="500" data-aos-duration="500">
        <div className="analysis-section">
          <h2 className="section-title">4. Remaining Questions</h2>
          <div className="content-box">
            <pre className="question-text">{questionWiseAnalysis}</pre>
          </div>
        </div>
      </div>
      <div data-aos="fade-left" data-aos-anchor="#example-anchor" data-aos-offset="500" data-aos-duration="500">
        <div className="analysis-section">
          <h2 className="section-title">5. Study Recommendations</h2>
          <div className="content-box">
            <pre className="question-text">{studyRecommendations}</pre>
          </div>
        </div>
      </div>
      <div data-aos="fade-left" data-aos-anchor="#example-anchor" data-aos-offset="500" data-aos-duration="500">
        <div className="analysis-section">
          <h2 className="section-title">6. Predictions</h2>
          <div className="content-box">
            <pre className="question-text">{predictions}</pre>
          </div>
        </div>
      </div>

      <div className="download-section-flex">
        <button 
          onClick={downloadPDF}
          className="download-pdf-btn"
        >
          Download PDF
        </button>
        {selectedModel === 'gemini' && papersText && promptTemplate && (
          <div className="ai-alt-btn-group">
            <div className="ai-alt-label">
              Didn't like the analysis? Try on ChatGPT or DeepSeek
            </div>
            <button
              className="try-other-ai-btn"
              onClick={() => setDialogOpen(true)}
            >
              Click here
            </button>
          </div>
        )}
      </div>
      <PromptDialog open={dialogOpen} onClose={() => setDialogOpen(false)} prompt={promptTemplate} rawText={papersText} />
    </div>
  );
};

export default AnalysisResults; 