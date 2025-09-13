import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService, DashboardStats } from '../../services/adminService';
import { getProductionDomain, getTeamUrl } from '../../utils/config';


const AdminDashboard: React.FC = () => {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  // const [selectedTeam, setSelectedTeam] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const data = await adminService.getDashboardStats();
        setDashboardStats(data);
        // if (data.teams.length > 0) {
        //   setSelectedTeam(data.teams[0]);
        // }
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


  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
        <p className="text-gray-600 mt-2">전체 시스템 현황과 서브도메인별 통계를 확인할 수 있습니다</p>
      </div>

      {/* 핵심 통계 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="text-gray-600 text-3xl mr-4">🏢</div>
            <div>
              <p className="text-sm text-gray-500">총 서브도메인</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardStats.totalTeams}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="text-gray-600 text-3xl mr-4">👥</div>
            <div>
              <p className="text-sm text-gray-500">전체 선수</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardStats.totalPlayers}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="text-gray-600 text-3xl mr-4">🏟️</div>
            <div>
              <p className="text-sm text-gray-500">전체 구장</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardStats.totalStadiums}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="text-gray-600 text-3xl mr-4">⚽</div>
            <div>
              <p className="text-sm text-gray-500">전체 경기</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardStats.totalMatches}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 서브도메인별 현황 */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">서브도메인별 현황</h2>
            <Link to="/admin/tenants" className="text-sm text-gray-600 hover:text-gray-900 font-medium">
              전체 관리 →
            </Link>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {dashboardStats.teams.map((team) => (
              <div key={team.id} className="border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{team.name}</h3>
                    <p className="text-sm text-gray-500">{team.code}.{getProductionDomain()}</p>
                  </div>
                  <a 
                    href={getTeamUrl(team.code)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-600"
                  >
                    🔗
                  </a>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{team.playerCount}</div>
                    <div className="text-xs text-gray-600">선수</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{team.stadiumCount}</div>
                    <div className="text-xs text-gray-600">구장</div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Link 
                    to={`/admin/players?teamId=${team.id}`} 
                    className="flex-1 text-center py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  >
                    선수 관리
                  </Link>
                  <Link 
                    to={`/admin/stadiums?teamId=${team.id}`} 
                    className="flex-1 text-center py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  >
                    구장 관리
                  </Link>
                </div>
              </div>
            ))}
            
            {/* 새 서브도메인 추가 카드 */}
            <Link to="/admin/tenants" className="border-2 border-dashed border-gray-300 rounded-lg p-5 hover:border-gray-400 transition-colors flex flex-col items-center justify-center min-h-[200px]">
              <div className="text-4xl text-gray-400 mb-2">+</div>
              <div className="text-sm text-gray-600 font-medium">새 서브도메인 생성</div>
              <div className="text-xs text-gray-500 text-center mt-1">축구 동호회를 위한<br/>새 서브도메인을 생성합니다</div>
            </Link>
          </div>
        </div>
      </div>

      {/* 관리 메뉴 */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">관리 메뉴</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/admin/tenants" className="group p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
              <div className="text-center">
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🏢</div>
                <div className="text-sm font-medium text-gray-900">서브도메인</div>
                <div className="text-xs text-gray-500">관리</div>
              </div>
            </Link>
            <Link to="/admin/teams" className="group p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
              <div className="text-center">
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🏆</div>
                <div className="text-sm font-medium text-gray-900">팀</div>
                <div className="text-xs text-gray-500">관리</div>
              </div>
            </Link>
            <Link to="/admin/players" className="group p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
              <div className="text-center">
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">👥</div>
                <div className="text-sm font-medium text-gray-900">선수</div>
                <div className="text-xs text-gray-500">관리</div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* 시스템 정보 */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">시스템 정보</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-green-600 text-2xl mb-2">✓</div>
              <div className="text-sm font-medium text-gray-900">시스템</div>
              <div className="text-xs text-green-600">정상 동작</div>
            </div>
            <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-blue-600 text-2xl mb-2">💾</div>
              <div className="text-sm font-medium text-gray-900">데이터베이스</div>
              <div className="text-xs text-blue-600">H2 인메모리</div>
            </div>
            <div className="text-center p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="text-gray-600 text-2xl mb-2">🌐</div>
              <div className="text-sm font-medium text-gray-900">활성 도메인</div>
              <div className="text-xs text-gray-600">{dashboardStats.totalTeams}개</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;