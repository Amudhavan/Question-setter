import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle, Clock, ChevronRight, BarChart } from 'lucide-react';
import { getHistory } from '../utils/storage';

export default function Dashboard() {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  if (history.length === 0) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '6rem' }}>
        <Clock size={48} color="var(--text-muted)" style={{ margin: '0 auto', marginBottom: '1.5rem' }} />
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>No Tests Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          You haven't generated or taken any tests yet.
        </p>
        <Link to="/" className="btn btn-primary">
          Generate Your First Test
        </Link>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Your History</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Review your past tests and performance.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {history.map((item) => {
          const date = new Date(item.submission ? item.submission.submittedAt : item.createdAt).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
          });
          
          return (
            <div key={item.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ background: 'var(--bg-tertiary)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={12} />
                  {date}
                </div>
                {item.isCompleted ? (
                  <div style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                    <CheckCircle size={16} /> Completed
                  </div>
                ) : (
                  <div style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', fontWeight: '500' }}>
                    <Clock size={16} /> Pending
                  </div>
                )}
              </div>

              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.topic || 'Assessment'}
              </h3>
              
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                {item.questions.length} Questions
              </p>

              {item.isCompleted ? (
                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Score</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                      {item.submission.score} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ {item.submission.totalQuestions}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate(`/report/${item.id}`)}
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  >
                    View Report <ChevronRight size={16} />
                  </button>
                </div>
              ) : (
                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem' }}>
                  <button 
                    onClick={() => navigate(`/test/${item.id}`)}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.75rem' }}
                  >
                    Resume Test
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
