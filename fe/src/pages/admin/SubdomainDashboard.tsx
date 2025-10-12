import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService, DashboardStats } from '../../services/adminService';
import { getProductionDomain } from '../../utils/config';

const SubdomainDashboard: React.FC = () => {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSubdomain, setCurrentSubdomain] = useState<string | null>(null);

  useEffect(() => {
    // 현재 서브도메인 추출
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    if (parts.length >= 2 && parts[0] !== 'www') {
      setCurrentSubdomain(parts[0]);
    }

    const fetchDashboardStats = async () => {
      try {
        const data = await adminService.getDashboardStats();
        setDashboardStats(data);
      } catch (error) {
        console.error('통계 데이터 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!dashboardStats) {
    return (
      <div className="text-center text-gray-500 mt-8">
        <p>통계 데이터를 불러올 수 없습니다.</p>
      </div>
    );
  }

  // 현재 서브도메인의 팀 정보 찾기
  const currentTeam = dashboardStats.teams.find(team => team.code === currentSubdomain);

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {currentTeam?.name || currentSubdomain} 관리자 대시보드
        </h1>
        <p className="text-gray-600 mt-2">
          {currentSubdomain}.{getProductionDomain()} 팀의 현황과 관리 메뉴입니다
        </p>
      </div>

      {/* 팀 통계 */}
      {currentTeam && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="text-gray-600 text-3xl mr-4">👥</div>
              <div>
                <p className="text-sm text-gray-500">팀 선수</p>
                <p className="text-3xl font-bold text-gray-900">{currentTeam.playerCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="text-gray-600 text-3xl mr-4">🏟️</div>
              <div>
                <p className="text-sm text-gray-500">이용 구장</p>
                <p className="text-3xl font-bold text-gray-900">{currentTeam.stadiumCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="text-gray-600 text-3xl mr-4">⚽</div>
              <div>
                <p className="text-sm text-gray-500">경기 수</p>
                <p className="text-3xl font-bold text-gray-900">{currentTeam.matchCount || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="text-gray-600 text-3xl mr-4">📊</div>
              <div>
                <p className="text-sm text-gray-500">승률</p>
                <p className="text-3xl font-bold text-gray-900">{currentTeam.winRate || 0}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 팀 관리 메뉴 */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">팀 관리</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/admin/players" className="group p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
              <div className="text-center">
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">👥</div>
                <div className="text-sm font-medium text-gray-900">선수 관리</div>
                <div className="text-xs text-gray-500">선수 등록/수정</div>
              </div>
            </Link>
            <Link to="/admin/stadiums" className="group p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
              <div className="text-center">
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🏟️</div>
                <div className="text-sm font-medium text-gray-900">구장 관리</div>
                <div className="text-xs text-gray-500">구장 정보 관리</div>
              </div>
            </Link>
            <Link to="/admin/matches" className="group p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
              <div className="text-center">
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">⚽</div>
                <div className="text-sm font-medium text-gray-900">경기 관리</div>
                <div className="text-xs text-gray-500">경기 일정/결과</div>
              </div>
            </Link>
            <Link to="/admin/hero-slides" className="group p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
              <div className="text-center">
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🖼️</div>
                <div className="text-sm font-medium text-gray-900">히어로 슬라이드</div>
                <div className="text-xs text-gray-500">메인 슬라이드</div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* 커뮤니티 관리 */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">커뮤니티 관리</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/admin/community/posts" className="group p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
              <div className="text-center">
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📝</div>
                <div className="text-sm font-medium text-gray-900">게시글 관리</div>
                <div className="text-xs text-gray-500">커뮤니티 게시글 관리</div>
              </div>
            </Link>
            <Link to="/admin/inquiries" className="group p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
              <div className="text-center">
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📩</div>
                <div className="text-sm font-medium text-gray-900">문의 관리</div>
                <div className="text-xs text-gray-500">팀 문의사항 관리</div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* 팀 정보 */}
      {currentTeam && (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">팀 정보</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{currentTeam.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{currentTeam.description || '팀 설명이 없습니다.'}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">팀 코드:</span>
                    <span className="font-medium">{currentTeam.code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">도메인:</span>
                    <span className="font-medium">{currentTeam.code}.{getProductionDomain()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">생성일:</span>
                    <span className="font-medium">{new Date(currentTeam.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-green-600 text-3xl mb-2">🏆</div>
                <div className="text-lg font-medium text-gray-900">{currentTeam.name}</div>
                <div className="text-sm text-green-600">활성 상태</div>
                <Link 
                  to={`/admin/teams/${currentTeam.id}`}
                  className="mt-3 inline-block text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  팀 설정 수정 →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubdomainDashboard;