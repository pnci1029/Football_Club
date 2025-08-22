import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TeamProvider, useTeam } from './contexts/TeamContext';
import Navigation from './components/layout/Navigation';
import AdminLayout from './components/layout/AdminLayout';
import Home from './pages/Home';
import Players from './pages/Players';
import Matches from './pages/Matches';
import Stadiums from './pages/Stadiums';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPlayers from './pages/admin/AdminPlayers';
import AdminTeams from './pages/admin/AdminTeams';
import AdminStadiums from './pages/admin/AdminStadiums';
import NotFound from './pages/NotFound';
import Landing from './pages/Landing';
import './App.css';

const AppContent: React.FC = () => {
  const hostname = window.location.hostname;

  // 메인 도메인인지 확인 (서브도메인이 없는 경우)
  const isMainDomain = hostname === 'localhost' ||
                      hostname === 'football-club.local' ||
                      hostname === 'footballclub.com';

  // 관리자 도메인인지 확인
  const isAdminDomain = hostname.startsWith('admin.');

  if (isMainDomain) {
    // 메인 도메인: 랜딩 페이지만 표시
    return <Landing />;
  }

  if (isAdminDomain) {
    // 관리자 도메인: 관리자 페이지
    return (
      <AdminLayout>
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/players" element={<AdminPlayers />} />
          <Route path="/teams" element={<AdminTeams />} />
          <Route path="/stadiums" element={<AdminStadiums />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AdminLayout>
    );
  }

  // 서브도메인: 팀별 사이트
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/players" element={<Players />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/stadiums" element={<Stadiums />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <TeamProvider>
      <Router>
        <AppContent />
      </Router>
    </TeamProvider>
  );
}

export default App;
