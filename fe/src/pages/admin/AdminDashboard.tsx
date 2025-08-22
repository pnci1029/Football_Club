import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/common';
import { adminService, TeamStats, DashboardStats } from '../../services/adminService';


const AdminDashboard: React.FC = () => {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const data = await adminService.getDashboardStats();
        setDashboardStats(data);
        if (data.teams.length > 0) {
          setSelectedTeam(data.teams[0]);
        }
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

  const overallStats = [
    {
      title: '총 팀',
      value: dashboardStats.totalTeams.toString(),
      icon: '🏆',
      color: 'bg-green-500',
      link: '/teams'
    },
    {
      title: '총 선수',
      value: dashboardStats.totalPlayers.toString(),
      icon: '👤',
      color: 'bg-blue-500',
      link: '/players'
    },
    {
      title: '총 구장',
      value: dashboardStats.totalStadiums.toString(),
      icon: '🏟️',
      color: 'bg-purple-500',
      link: '/stadiums'
    },
    {
      title: '총 경기',
      value: dashboardStats.totalMatches.toString(),
      icon: '⚽',
      color: 'bg-orange-500',
      link: '/matches'
    }
  ];

  const teamStats = selectedTeam ? [
    {
      title: '팀 선수',
      value: selectedTeam.playerCount.toString(),
      icon: '👤',
      color: 'bg-blue-500',
      link: `/players?teamId=${selectedTeam.id}`
    },
    {
      title: '팀 구장',
      value: selectedTeam.stadiumCount.toString(),
      icon: '🏟️',
      color: 'bg-purple-500',
      link: `/stadiums?teamId=${selectedTeam.id}`
    }
  ] : [];

  const quickActions = [
    {
      title: '팀 생성',
      description: '새로운 팀을 생성합니다',
      icon: '🆕',
      color: 'bg-green-500 hover:bg-green-600',
      link: '/teams/new'
    },
    {
      title: '선수 추가',
      description: selectedTeam ? `${selectedTeam.name}에 선수 추가` : '팀을 선택하고 선수를 추가합니다',
      icon: '➕',
      color: 'bg-blue-500 hover:bg-blue-600',
      link: selectedTeam ? `/players/new?teamId=${selectedTeam.id}` : '/players'
    },
    {
      title: '구장 등록',
      description: '새로운 구장을 시스템에 등록합니다',
      icon: '🏗️',
      color: 'bg-purple-500 hover:bg-purple-600',
      link: '/stadiums/new'
    },
    {
      title: '경기 일정 관리',
      description: '경기 일정을 생성하고 관리합니다',
      icon: '📅',
      color: 'bg-orange-500 hover:bg-orange-600',
      link: '/matches/new'
    }
  ];

  const recentActivities = [
    { action: '최근 활동 로그는 개발 중입니다', time: '개발 예정', type: 'info' },
  ];

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
          <p className="text-gray-600 mt-2">축구 클럽 관리 시스템에 오신 것을 환영합니다</p>
        </div>
        <div className="text-sm text-gray-500">
          마지막 업데이트: {new Date().toLocaleDateString('ko-KR')}
        </div>
      </div>

      {/* 팀 선택 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">구단 선택</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {dashboardStats.teams.map((team) => (
            <button
              key={team.id}
              onClick={() => setSelectedTeam(team)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                selectedTeam?.id === team.id
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{team.name}</h3>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{team.code}</span>
              </div>
              <div className="text-sm text-gray-600">
                <p>선수: {team.playerCount}명</p>
                <p>구장: {team.stadiumCount}개</p>
              </div>
            </button>
          ))}
        </div>
        {selectedTeam && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900">선택된 구단: {selectedTeam.name}</h3>
            <p className="text-blue-700 text-sm">구단 코드: {selectedTeam.code}</p>
          </div>
        )}
      </div>

      {/* 전체 통계 카드 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">전체 통계</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {overallStats.map((stat, index) => (
            <Link key={index} to={stat.link}>
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center">
                  <div className={`${stat.color} p-3 rounded-lg text-white text-2xl mr-4`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* 선택된 구단 통계 */}
      {selectedTeam && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{selectedTeam.name} 통계</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teamStats.map((stat, index) => (
              <Link key={index} to={stat.link}>
                <Card className="hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-center">
                    <div className={`${stat.color} p-3 rounded-lg text-white text-2xl mr-4`}>
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 빠른 작업 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">빠른 작업</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.link}>
              <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105">
                <div className="text-center">
                  <div className={`${action.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl transition-colors duration-200`}>
                    {action.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* 최근 활동 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">최근 활동</h2>
        <Card>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                    {activity.type === 'player' && '👤'}
                    {activity.type === 'stadium' && '🏟️'}
                    {activity.type === 'team' && '🏆'}
                    {activity.type === 'match' && '⚽'}
                    {activity.type === 'info' && 'ℹ️'}
                  </div>
                  <div>
                    <p className="text-gray-900">{activity.action}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">{activity.time}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;