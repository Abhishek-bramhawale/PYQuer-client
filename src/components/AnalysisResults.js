import React from 'react';

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
    </div>
  );
};

export default AnalysisResults; 