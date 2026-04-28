import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, AlertCircle, BarChart3, ListChecks } from 'lucide-react';
import { getTestById, getSubmissionByTestId } from '../utils/storage';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function ReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('review'); // 'review' or 'analysis'

  useEffect(() => {
    const loadedTest = getTestById(id);
    const loadedSubmission = getSubmissionByTestId(id);

    if (!loadedTest) {
      setError("Test not found.");
      return;
    }
    if (!loadedSubmission) {
      navigate(`/test/${id}`);
      return;
    }

    setTest(loadedTest);
    setSubmission(loadedSubmission);
  }, [id, navigate]);

  if (error) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <AlertCircle size={48} color="var(--error)" style={{ margin: '0 auto', marginBottom: '1rem' }} />
        <h2>{error}</h2>
      </div>
    );
  }

  if (!test || !submission) {
    return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading report...</div>;
  }

  // Calculate stats
  const scorePercentage = Math.round((submission.score / submission.totalQuestions) * 100);
  
  // Prepare Analysis Data
  const topicStats = {};
  test.questions.forEach((q, index) => {
    const subTopic = q.subTopic || 'General';
    if (!topicStats[subTopic]) {
      topicStats[subTopic] = { total: 0, correct: 0 };
    }
    topicStats[subTopic].total++;
    if (submission.answers[index] === q.correctOptionIndex) {
      topicStats[subTopic].correct++;
    }
  });

  const chartData = Object.keys(topicStats).map(topic => {
    const stat = topicStats[topic];
    const percentage = Math.round((stat.correct / stat.total) * 100);
    return {
      name: topic,
      score: percentage,
      fill: percentage < 50 ? 'var(--error)' : percentage < 80 ? 'var(--warning)' : 'var(--success)'
    };
  });

  return (
    <div className="report-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header Section */}
      <div className="glass-card" style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Results: {test.topic}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Completed on {new Date(submission.submittedAt).toLocaleDateString()}
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: scorePercentage >= 80 ? 'var(--success)' : scorePercentage >= 50 ? 'var(--warning)' : 'var(--error)' }}>
            {scorePercentage}%
          </div>
          <div style={{ color: 'var(--text-secondary)' }}>
            {submission.score} out of {submission.totalQuestions} correct
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => setActiveTab('review')}
          className={`btn ${activeTab === 'review' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ flex: 1 }}
        >
          <ListChecks size={20} /> Review Answers
        </button>
        <button 
          onClick={() => setActiveTab('analysis')}
          className={`btn ${activeTab === 'analysis' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ flex: 1 }}
        >
          <BarChart3 size={20} /> View Analysis
        </button>
      </div>

      {/* Tab Content: Analysis */}
      {activeTab === 'analysis' && (
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>Performance by Sub-topic</h2>
          <div style={{ height: '400px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="var(--text-secondary)" 
                  tick={{ fill: 'var(--text-secondary)' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke="var(--text-secondary)" 
                  tick={{ fill: 'var(--text-secondary)' }}
                  domain={[0, 100]}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip 
                  cursor={{ fill: 'var(--bg-tertiary)' }}
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}
                  formatter={(value) => [`${value}%`, 'Score']}
                />
                <Bar dataKey="score" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div style={{ marginTop: '3rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Key Insights</h3>
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
              {chartData.filter(d => d.score < 60).length > 0 ? (
                chartData.filter(d => d.score < 60).map((topic, i) => (
                  <div key={i} style={{ padding: '1rem', background: 'var(--error-bg)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--error)' }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--error)', marginBottom: '0.25rem' }}>Needs Improvement</div>
                    Your score in <strong>{topic.name}</strong> is low ({topic.score}%). Review this area.
                  </div>
                ))
              ) : (
                <div style={{ padding: '1rem', background: 'var(--success-bg)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--success)' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--success)', marginBottom: '0.25rem' }}>Great Job!</div>
                  You don't have any major weak areas in this topic.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Review */}
      {activeTab === 'review' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {test.questions.map((q, qIndex) => {
            const userAnswer = submission.answers[qIndex];
            const isCorrect = userAnswer === q.correctOptionIndex;
            const isUnanswered = userAnswer === undefined || userAnswer === null;

            return (
              <div key={qIndex} className="glass-card" style={{ padding: '2rem', borderLeft: `4px solid ${isCorrect ? 'var(--success)' : 'var(--error)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', paddingRight: '2rem' }}>
                    <span style={{ color: 'var(--text-secondary)', marginRight: '0.5rem' }}>{qIndex + 1}.</span>
                    {q.question}
                  </h3>
                  {isCorrect ? (
                    <CheckCircle2 size={24} color="var(--success)" style={{ flexShrink: 0 }} />
                  ) : (
                    <XCircle size={24} color="var(--error)" style={{ flexShrink: 0 }} />
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  {q.options.map((opt, oIndex) => {
                    let bg = 'var(--bg-secondary)';
                    let border = '1px solid var(--border-light)';
                    let color = 'var(--text-primary)';
                    
                    if (oIndex === q.correctOptionIndex) {
                      bg = 'var(--success-bg)';
                      border = '1px solid var(--success)';
                      color = 'var(--success)';
                    } else if (oIndex === userAnswer && !isCorrect) {
                      bg = 'var(--error-bg)';
                      border = '1px solid var(--error)';
                      color = 'var(--error)';
                    }

                    return (
                      <div key={oIndex} style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: bg, border, color, display: 'flex', justifyContent: 'space-between' }}>
                        <span>{opt}</span>
                        {oIndex === q.correctOptionIndex && <CheckCircle2 size={18} />}
                        {oIndex === userAnswer && !isCorrect && <XCircle size={18} />}
                      </div>
                    );
                  })}
                </div>

                {(!isCorrect || isUnanswered) && (
                  <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-focus)' }}>
                    <h4 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Explanation</h4>
                    <p style={{ color: 'var(--text-primary)', lineHeight: 1.6 }}>{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
