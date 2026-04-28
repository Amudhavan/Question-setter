import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, ChevronRight, AlertCircle } from 'lucide-react';
import { getTestById, saveSubmission, getSubmissionByTestId } from '../utils/storage';

export default function TestPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({}); // mapping questionIndex -> selectedOptionIndex
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadedTest = getTestById(id);
    if (!loadedTest) {
      setError("Test not found. It may have been deleted or never existed.");
      return;
    }

    // Check if already submitted
    const existingSubmission = getSubmissionByTestId(id);
    if (existingSubmission) {
      navigate(`/report/${id}`);
      return;
    }

    setTest(loadedTest);
  }, [id, navigate]);

  const handleOptionSelect = (qIndex, oIndex) => {
    if (answers[qIndex] !== undefined) return;
    setAnswers(prev => ({ ...prev, [qIndex]: oIndex }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check if all questions are answered
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < test.questions.length) {
      const confirmSubmit = window.confirm(`You have only answered ${answeredCount} out of ${test.questions.length} questions. Are you sure you want to submit?`);
      if (!confirmSubmit) return;
    }

    setIsSubmitting(true);
    
    // Calculate score
    let score = 0;
    test.questions.forEach((q, index) => {
      if (answers[index] === q.correctOptionIndex) {
        score++;
      }
    });

    // Save submission
    saveSubmission(id, answers, score, test.questions.length);
    
    // Navigate to report
    navigate(`/report/${id}`);
  };

  if (error) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <AlertCircle size={48} color="var(--error)" style={{ margin: '0 auto', marginBottom: '1rem' }} />
        <h2>{error}</h2>
        <button className="btn btn-primary" onClick={() => navigate('/')} style={{ marginTop: '2rem' }}>
          Go Home
        </button>
      </div>
    );
  }

  if (!test) {
    return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading test...</div>;
  }

  const answeredCount = Object.keys(answers).length;
  const progressPercentage = (answeredCount / test.questions.length) * 100;

  return (
    <div className="test-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{test.topic || 'Assessment'}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Answer all {test.questions.length} questions to the best of your ability.
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
            {answeredCount} / {test.questions.length}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Answered</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '8px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', marginBottom: '3rem', overflow: 'hidden' }}>
        <div style={{ 
          height: '100%', 
          background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
          width: `${progressPercentage}%`,
          transition: 'width 0.3s ease'
        }} />
      </div>

      <div className="questions-list" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {test.questions.map((q, qIndex) => (
          <div key={qIndex} className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
              <span style={{ color: 'var(--accent-primary)' }}>{qIndex + 1}.</span> 
              <span>{q.question}</span>
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {q.options.map((opt, oIndex) => {
                const isAnswered = answers[qIndex] !== undefined;
                const userAnswer = answers[qIndex];
                const isSelected = userAnswer === oIndex;
                const isCorrectOption = q.correctOptionIndex === oIndex;
                
                let bg = 'var(--bg-secondary)';
                let border = '1px solid var(--border-light)';
                let color = 'var(--text-primary)';
                let cursor = isAnswered ? 'default' : 'pointer';
                let Icon = null;

                if (isAnswered) {
                  if (isCorrectOption) {
                    bg = 'var(--success-bg)';
                    border = '1px solid var(--success)';
                    color = 'var(--success)';
                    Icon = <CheckCircle2 size={20} color="var(--success)" />;
                  } else if (isSelected) {
                    bg = 'var(--error-bg)';
                    border = '1px solid var(--error)';
                    color = 'var(--error)';
                    Icon = <XCircle size={20} color="var(--error)" />;
                  }
                } else if (isSelected) {
                  bg = 'var(--bg-glass-hover)';
                  border = '1px solid var(--accent-primary)';
                  color = 'white';
                  Icon = <CheckCircle2 size={20} color="var(--accent-primary)" />;
                }

                return (
                  <button
                    key={oIndex}
                    onClick={() => handleOptionSelect(qIndex, oIndex)}
                    disabled={isAnswered}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem 1.5rem',
                      borderRadius: 'var(--radius-md)',
                      background: bg,
                      border: border,
                      color: color,
                      cursor: cursor,
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      boxShadow: isSelected && !isAnswered ? 'var(--shadow-glow)' : 'none'
                    }}
                  >
                    <span style={{ fontSize: '1rem' }}>{opt}</span>
                    {Icon}
                  </button>
                );
              })}
            </div>

            {answers[qIndex] !== undefined && answers[qIndex] !== q.correctOptionIndex && (
              <div style={{ marginTop: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--error)' }}>
                <h4 style={{ color: 'var(--error)', marginBottom: '0.5rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Explanation</h4>
                <p style={{ color: 'var(--text-primary)', lineHeight: 1.6 }}>{q.explanation}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'flex-end', position: 'sticky', bottom: '2rem' }}>
        <button 
          className="btn btn-primary" 
          onClick={handleSubmit}
          disabled={isSubmitting}
          style={{ padding: '1rem 2rem', fontSize: '1.2rem', boxShadow: 'var(--shadow-lg)' }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Test'}
          {!isSubmitting && <ChevronRight size={20} />}
        </button>
      </div>
    </div>
  );
}
