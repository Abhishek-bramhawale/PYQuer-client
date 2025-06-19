import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnalysisResults from './AnalysisResults';

const API_URL = '/api/ai/history';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  return (
    <div className="history-page" style={{ width: '100%', maxWidth: 1300, margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24, color: '#540ac9', fontWeight: 800, fontSize: '2rem' }}>Your Analysis History</h2>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red', textAlign: 'center', margin: '20px 0' }}>{error}</div>}
      {!loading && !error && history.length === 0 && (
        <div style={{ textAlign: 'center', color: '#888' }}>No analysis history found.</div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {history.map((item, idx) => (
          <div key={item._id || idx} style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: 12,
            boxShadow: '0 2px 12px rgba(84,10,201,0.08)',
            padding: 20,
            borderLeft: `6px solid ${item.modelUsed === 'gemini' ? '#4285F4' : item.modelUsed === 'cohere' ? '#FBBF24' : '#7C3AED'}`,
            position: 'relative',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 18, color: '#222' }}>{item.modelUsed.toUpperCase()}</span>
              <span style={{ color: '#666', fontSize: 14 }}>{new Date(item.createdAt).toLocaleString()}</span>
            </div>
            <div style={{ marginBottom: 8, color: '#333', fontSize: 15 }}>
              <b>Papers:</b> {item.papersInfo && item.papersInfo.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {item.papersInfo.map((p, i) => (
                    <li key={i}>
                      {p.originalName}
                      {p.fileId && (
                        <>
                          {' '}
                          <a
                            href={`/uploads/${p.fileId}`}
                            download={p.originalName}
                            style={{ marginLeft: 8, color: '#540ac9', textDecoration: 'underline', fontSize: 13 }}
                            target="_blank"
                            rel="noopener noreferrer"
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
            <AnalysisResults analysis={{ analysis: item.analysis }} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default History; 