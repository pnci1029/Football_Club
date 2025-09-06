import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TeamProvider } from './contexts/TeamContext';
import { AuthProvider } from './contexts/AuthContext';
import Navigation from './components/layout/Navigation';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Home from './pages/Home';
import Players from './pages/Players';
import Matches from './pages/Matches';
import Stadiums from './pages/Stadiums';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPlayers from './pages/admin/AdminPlayers';
import AdminTeams from './pages/admin/AdminTeams';
import AdminStadiums from './pages/admin/AdminStadiums';
import AdminMatches from './pages/admin/AdminMatches';
import AdminInquiries from './pages/admin/AdminInquiries';
import TenantManagement from './pages/admin/TenantManagement';
import NotFound from './pages/NotFound';
import Landing from './pages/Landing';
import './App.css';

const AppContent: React.FC = () => {
  const hostname = window.location.hostname;

  // 디버깅용 로그 (프로덕션에서 제거 필요)
  console.log('Current hostname:', hostname);

  // 메인 도메인인지 확인 (서브도메인이 없는 경우)
  const isMainDomain = hostname === 'localhost' ||
                      hostname === 'football-club.local' ||
                      hostname === 'football-club.kr';

  // 관리자 도메인인지 확인
  const isAdminDomain = hostname === 'admin.localhost' ||
                       hostname.startsWith('admin.');

  console.log('isMainDomain:', isMainDomain, 'isAdminDomain:', isAdminDomain);

  if (isMainDomain) {
    // 메인 도메인: 랜딩 페이지만 표시
    return <Landing />;
  }

  if (isAdminDomain) {
    // 관리자 도메인: 관리자 페이지 (인증 필요)
    return (
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/*" element={
          <ProtectedRoute>
            <AdminLayout>
              <Routes>
                <Route path="/dashboard" element={<AdminDashboard />} />
                <Route path="/tenants" element={<TenantManagement />} />
                <Route path="/players" element={<AdminPlayers />} />
                <Route path="/teams" element={<AdminTeams />} />
                <Route path="/stadiums" element={<AdminStadiums />} />
                <Route path="/matches" element={<AdminMatches />} />
                <Route path="/inquiries" element={<AdminInquiries />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </ProtectedRoute>
        } />
        {/* Legacy routes - redirect to /admin */}
        <Route path="/tenants" element={
          <ProtectedRoute>
            <AdminLayout>
              <TenantManagement />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/players" element={
          <ProtectedRoute>
            <AdminLayout>
              <AdminPlayers />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/teams" element={
          <ProtectedRoute>
            <AdminLayout>
              <AdminTeams />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/stadiums" element={
          <ProtectedRoute>
            <AdminLayout>
              <AdminStadiums />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/matches" element={
          <ProtectedRoute>
            <AdminLayout>
              <AdminMatches />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/inquiries" element={
          <ProtectedRoute>
            <AdminLayout>
              <AdminInquiries />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
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
    <AuthProvider>
      <TeamProvider>
        <Router>
          <AppContent />
        </Router>
      </TeamProvider>
    </AuthProvider>
  );
}

export default App;
