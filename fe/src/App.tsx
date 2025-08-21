import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TeamProvider } from './contexts/TeamContext';
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
import './App.css';

function App() {
  return (
    <TeamProvider>
      <Router>
        <Routes>
          {/* 관리자 라우트 */}
          <Route path="/admin/*" element={
            <AdminLayout>
              <Routes>
                <Route path="/" element={<AdminDashboard />} />
                <Route path="/players" element={<AdminPlayers />} />
                <Route path="/teams" element={<AdminTeams />} />
                <Route path="/stadiums" element={<AdminStadiums />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AdminLayout>
          } />
          
          {/* 일반 사용자 라우트 */}
          <Route path="/*" element={
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
          } />
        </Routes>
      </Router>
    </TeamProvider>
  );
}

export default App;
