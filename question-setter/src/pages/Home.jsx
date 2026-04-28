import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wand2, AlertCircle, Loader2 } from 'lucide-react';
import { generateMCQTest } from '../utils/geminiApi';
import { saveTest } from '../utils/storage';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [numQuestions, setNumQuestions] = useState(25);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const MAX_CHARS = 2000;
  const MIN_CHARS = 10;

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (prompt.length < MIN_CHARS) {
      setError(`Prompt must be at least ${MIN_CHARS} characters.`);
      return;
    }
    
    if (prompt.length > MAX_CHARS) {
      setError(`Prompt exceeds the maximum limit of ${MAX_CHARS} characters.`);
      return;
    }

    setIsLoading(true);
    try {
      // 1. Call Gemini to generate questions
      const generatedData = await generateMCQTest(prompt, numQuestions);
      
      // 2. Save it to local storage
      const savedTest = saveTest(generatedData);
      
      // 3. Navigate to the test taking page
      navigate(`/test/${savedTest.id}`);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred while generating the test.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="home-container" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '2rem' }}>
      <div className="hero-section" style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          Generate <span className="gradient-text">Masterful Quizzes</span> in Seconds
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          Enter any topic, text, or prompt below. Our AI will instantly create a comprehensive multiple-choice test tailored to your input.
        </p>
      </div>

      <div className="glass-card">
        <form onSubmit={handleGenerate}>
          <div className="input-group">
            <label htmlFor="prompt" className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>What do you want to be tested on?</span>
              <span style={{ color: prompt.length > MAX_CHARS ? 'var(--error)' : 'inherit' }}>
                {prompt.length} / {MAX_CHARS}
              </span>
            </label>
            <textarea
              id="prompt"
              className="input-field"
              rows="6"
              placeholder="e.g. The history of the Roman Empire, focusing on the fall of the Republic..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading}
              style={{
                borderColor: prompt.length > MAX_CHARS ? 'var(--error)' : '',
              }}
            />
          </div>

          <div className="input-group">
            <label htmlFor="numQuestions" className="input-label">
              Number of questions (1-50)
            </label>
            <input
              type="number"
              id="numQuestions"
              className="input-field"
              min="1"
              max="50"
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              disabled={isLoading}
            />
          </div>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              color: 'var(--error)', backgroundColor: 'var(--error-bg)',
              padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem'
            }}>
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
            disabled={isLoading || prompt.length === 0 || prompt.length > MAX_CHARS}
          >
            {isLoading ? (
              <>
                <Loader2 className="spin" size={24} />
                Crafting your test (this may take 10-20 seconds)...
              </>
            ) : (
              <>
                <Wand2 size={24} />
                Generate {numQuestions}-Question Test
              </>
            )}
          </button>
        </form>
      </div>
      
      {/* Adding a global style block for the spinner animation just for convenience, though it could be in index.css */}
      <style dangerouslySetInnerHTML={{__html: `
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}
