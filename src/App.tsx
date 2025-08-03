import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { AboutPage } from './pages/AboutPage';
import { WritingStudio } from './pages/WritingStudio';
import { ProfilePage } from './pages/ProfilePage';

function App() {
  return (
    <Router>
      <div className="min-h-screen" style={{ backgroundColor: '#FEF7ED' }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/write" element={<WritingStudio />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          {/* Placeholder routes for future implementation */}
          <Route path="/article/:slug" element={<div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FEF7ED' }}><p className="text-neutral-600">Article page coming soon!</p></div>} />
          <Route path="/community" element={<div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FEF7ED' }}><p className="text-neutral-600">Community page coming soon!</p></div>} />
          <Route path="/dashboard" element={<div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FEF7ED' }}><p className="text-neutral-600">Dashboard coming soon!</p></div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;