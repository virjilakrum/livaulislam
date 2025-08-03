import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { AboutPage } from './pages/AboutPage';
import { WritingStudio } from './pages/WritingStudio';
import { ProfilePage } from './pages/ProfilePage';
import { ArticleDetailPage } from './pages/ArticleDetailPage';
import { DashboardPage } from './pages/DashboardPage';
import { SettingsPage } from './pages/SettingsPage';
import { LikedArticlesPage } from './pages/LikedArticlesPage';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { CommunityPage } from './pages/CommunityPage';

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
          <Route path="/article/:slug" element={<ArticleDetailPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/liked" element={<LikedArticlesPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/community" element={<CommunityPage />} />
          {/* Placeholder routes for future implementation */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;