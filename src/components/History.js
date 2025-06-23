import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnalysisResults from './AnalysisResults';

const API_URL = '/api/ai/history';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedIdx, setExpandedIdx] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('You must be logged in to view your history.');
          setLoading(false);
          return;
        }
        const res = await fetch(API_URL, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error('Failed to fetch history');
        }
        const data = await res.json();
        setHistory(data.history || []);
      } catch (err) {
        setError(err.message || 'Error fetching history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleToggle = (idx) => {
    setExpandedIdx(expandedIdx === idx ? null : idx);
  };

  return (
    <div className="history-page">
      <h2 className="history-title">Your Analysis History</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="history-error">{error}</div>}
      {!loading && !error && history.length === 0 && (
        <div className="history-empty">No analysis history found.</div>
      )}
      <div className="history-list">
        {history.map((item, idx) => {
          const isExpanded = expandedIdx === idx;
          return (
            <div
              key={item._id || idx}
              className={`history-item${isExpanded ? ' history-item-expanded' : ''}`}
              style={{ borderLeft: `6px solid ${item.modelUsed === 'gemini' ? '#4285F4' : item.modelUsed === 'cohere' ? '#FBBF24' : '#7C3AED'}` }}
            >
              <div className="history-item-header">
                <span className="history-item-model">{item.modelUsed.toUpperCase()}</span>
                <span className="history-item-date">{new Date(item.createdAt).toLocaleString()}</span>
                <span
                  className={`history-item-toggle${isExpanded ? ' expanded' : ''}`}
                  tabIndex={0}
                  aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
                  onClick={e => { e.stopPropagation(); handleToggle(idx); }}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleToggle(idx); } }}
                  role="button"
                >
                  &gt;
                </span>
              </div>
              <div className="history-item-papers">
                <b>Papers:</b> {item.papersInfo && item.papersInfo.length > 0 ? (
                  <ul className="history-item-paper-list">
                    {item.papersInfo.map((p, i) => (
                      <li key={i} className="history-item-paper">
                        {p.originalName}
                        {p.fileId && (
                          <>
                            {' '}
                            <a
                              href={`/uploads/${p.fileId}`}
                              download={p.originalName}
                              className="history-item-paper-link"
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                            >
                              Download PDF
                            </a>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : 'N/A'}
              </div>
              {isExpanded && (
                <div className="history-item-analysis">
                  <AnalysisResults analysis={{ analysis: item.analysis }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default History; 