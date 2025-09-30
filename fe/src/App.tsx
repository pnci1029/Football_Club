import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TeamProvider, useTeam } from './contexts/TeamContext';
import { AuthProvider } from './contexts/AuthContext';
import Navigation from './components/layout/Navigation';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Home from './pages/Home';
import Players from './pages/Players';
import Matches from './pages/Matches';
import Stadiums from './pages/Stadiums';
import Community from './pages/Community';
import CommunityWrite from './pages/CommunityWrite';
import CommunityDetail from './pages/CommunityDetail';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPlayers from './pages/admin/AdminPlayers';
import AdminTeams from './pages/admin/AdminTeams';
import AdminTeamDetail from './pages/admin/AdminTeamDetail';
import AdminMatches from './pages/admin/AdminMatches';
import AdminInquiries from './pages/admin/AdminInquiries';
import AdminHeroSlides from './pages/admin/AdminHeroSlides';
import TenantManagement from './pages/admin/TenantManagement';
import NotFound from './pages/NotFound';
import Landing from './pages/Landing';
import AllCommunityPage from './pages/AllCommunityPage';
import Notices from './pages/Notices';
import NoticeDetail from './pages/NoticeDetail';
import GlobalNotices from './pages/GlobalNotices';
import './App.css';

import { isMainDomain } from './utils/config';

// 개발 환경에서만 API 테스터 로드
if (process.env.NODE_ENV === 'development') {
  import('./utils/api-tester');
}

const AppContent: React.FC = () => {
  const hostname = window.location.hostname;
  const { teamNotFound, isLoading } = useTeam();

  const isAdminDomain = hostname === 'admin.localhost' ||
                       hostname.startsWith('admin.');

  if (isMainDomain(hostname)) {
    // 메인 도메인: 랜딩 페이지와 전체 커뮤니티
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/community" element={<AllCommunityPage />} />
          <Route path="/global-notices" element={<GlobalNotices />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    );
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
                <Route path="/hero-slides" element={<AdminHeroSlides />} />
                <Route path="/players" element={<AdminPlayers />} />
                <Route path="/teams" element={<AdminTeams />} />
                <Route path="/teams/:teamId" element={<AdminTeamDetail />} />
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
        <Route path="/teams/:teamId" element={
          <ProtectedRoute>
            <AdminLayout>
              <AdminTeamDetail />
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
        <Route path="/hero-slides/:teamId" element={
          <ProtectedRoute>
            <AdminLayout>
              <AdminHeroSlides />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  }

  // 로딩 중이거나 팀이 존재하지 않는 경우 처리
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">팀 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (teamNotFound) {
    return <NotFound />;
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
          <Route path="/community" element={<Community />} />
          <Route path="/community/write" element={<CommunityWrite />} />
          <Route path="/community/:postId" element={<CommunityDetail />} />
          <Route path="/notices" element={<Notices />} />
          <Route path="/notices/:noticeId" element={<NoticeDetail />} />
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
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </TeamProvider>
  );
}

export default App;
