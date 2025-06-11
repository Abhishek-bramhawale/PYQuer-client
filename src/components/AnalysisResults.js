import React from 'react';
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

const AnalysisResults = ({ analysis, isLoading, error }) => {
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
      if (y + (lines.length * lineHeight) > pageHeight) {
        doc.addPage();
        y = 20;
      }
      doc.text(lines, x, y);
      return y + (lines.length * lineHeight) + 5;
    };
    
    const addSection = (title, content) => {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      yPosition = addWrappedText(title, margin, yPosition, 170);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      yPosition = addWrappedText(content, margin, yPosition, 170);
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
      <h1 className="main-title">Analysis Results</h1>
      <hr className="divider" />

      {renderTableSection('1. Repeated Questions Analysis', repeatedQuestions, ['Question', 'Repeated Count', 'Papers Appeared'])}
      {renderTableSection('2. Questions Asking for Differences', differenceQuestions, ['Question', 'Papers Appeared'])}
      {renderTableSection('3. Questions Requiring Diagrams', diagramQuestions, ['Question', 'Papers Appeared'])}

      <div className="analysis-section">
        <h2 className="section-title">4. Remaining Questions</h2>
        <div className="content-box">
          <pre className="question-text">{questionWiseAnalysis}</pre>
        </div>
      </div>

      <div className="analysis-section">
        <h2 className="section-title">5. Study Recommendations</h2>
        <div className="content-box">
          <pre className="question-text">{studyRecommendations}</pre>
        </div>
      </div>

      <div className="analysis-section">
        <h2 className="section-title">6. Predictions</h2>
        <div className="content-box">
          <pre className="question-text">{predictions}</pre>
        </div>
      </div>

      <div className="download-section">
        <button 
          onClick={downloadPDF}
          className="download-pdf-btn"
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: 'pointer',
            marginTop: '20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          📄 Download PDF
        </button>
      </div>
    </div>
  );
};

export default AnalysisResults; 