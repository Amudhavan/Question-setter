import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { BrainCircuit, History } from 'lucide-react';
import Home from './pages/Home';
import TestPage from './pages/TestPage';
import Dashboard from './pages/Dashboard';
import ReportPage from './pages/ReportPage';

function Header() {
  const location = useLocation();
  
  return (
    <header>
      <div className="container header-content">
        <Link to="/" className="logo">
          <BrainCircuit className="logo-icon" color="var(--accent-primary)" />
          <span>Quiz<span className="gradient-text">AI</span></span>
        </Link>
        <nav>
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Create
          </Link>
          <Link 
            to="/history" 
            className={`nav-link ${location.pathname.startsWith('/history') ? 'active' : ''}`}
          >
            <History size={18} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
            History
          </Link>
        </nav>
      </div>
    </header>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/test/:id" element={<TestPage />} />
          <Route path="/history" element={<Dashboard />} />
          <Route path="/report/:id" element={<ReportPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
