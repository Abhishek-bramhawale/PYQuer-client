import React from 'react';

const AnalysisResults = ({ analysis, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="analysis-results loading">
        <div className="loading-spinner"></div>
        <p>Analyzing your papers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analysis-results error">
        <h3>Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  // Function to convert markdown-like text to HTML
  const formatAnalysis = (text) => {
    if (!text) return null;

    // Split the text into sections
    const sections = text.split('\n\n').filter(section => section.trim());

    return sections.map((section, index) => {
      // Handle tables
      if (section.includes('|')) {
        const rows = section.split('\n').filter(row => row.trim());
        const tableRows = rows.map((row, rowIndex) => {
          const cells = row.split('|').filter(cell => cell.trim());
          if (rowIndex === 0) {
            // Header row
            return (
              <tr key={rowIndex}>
                {cells.map((cell, cellIndex) => (
                  <th key={cellIndex}>{cell.trim()}</th>
                ))}
              </tr>
            );
          } else if (row.includes('---')) {
            // Skip separator row
            return null;
          } else {
            // Data row
            return (
              <tr key={rowIndex}>
                {cells.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell.trim()}</td>
                ))}
              </tr>
            );
          }
        }).filter(Boolean);

        return (
          <div key={index} className="analysis-section">
            <table>{tableRows}</table>
          </div>
        );
      }

      // Handle headers
      if (section.startsWith('# ')) {
        return <h1 key={index}>{section.substring(2)}</h1>;
      }
      if (section.startsWith('## ')) {
        return <h2 key={index}>{section.substring(3)}</h2>;
      }
      if (section.startsWith('### ')) {
        return <h3 key={index}>{section.substring(4)}</h3>;
      }

      // Handle lists
      if (section.startsWith('- ') || section.startsWith('* ')) {
        const items = section.split('\n').map(item => item.trim());
        return (
          <ul key={index}>
            {items.map((item, itemIndex) => (
              <li key={itemIndex}>{item.substring(2)}</li>
            ))}
          </ul>
        );
      }

      // Handle numbered lists
      if (/^\d+\.\s/.test(section)) {
        const items = section.split('\n').map(item => item.trim());
        return (
          <ol key={index}>
            {items.map((item, itemIndex) => (
              <li key={itemIndex}>{item.replace(/^\d+\.\s/, '')}</li>
            ))}
          </ol>
        );
      }

      // Regular paragraph
      return <p key={index}>{section}</p>;
    });
  };

  return (
    <div className="analysis-results">
      <div className="analysis-content">
        {formatAnalysis(analysis)}
      </div>
    </div>
  );
};

export default AnalysisResults; 