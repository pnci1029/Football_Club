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
    <div className="space-y-6">
      {/* 전체 통계 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {overallStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-lg text-white text-2xl mr-4`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 서브도메인 관리 테이블 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">서브도메인 관리</h2>
            <Link to="/tenants" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
              전체 관리
            </Link>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  서브도메인
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  팀명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  선수 수
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  구장 수
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dashboardStats.teams.slice(0, 5).map((team) => (
                <tr key={team.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-blue-600">
                      {team.code}.localhost:3000
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{team.name}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {team.playerCount}명
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {team.stadiumCount}개
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Link to={`/players?teamId=${team.id}`} className="text-blue-600 hover:text-blue-900">선수관리</Link>
                    <Link to={`/stadiums?teamId=${team.id}`} className="text-green-600 hover:text-green-900">구장관리</Link>
                    <a 
                      href={`http://${team.code}.localhost:3000`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-900"
                    >
                      방문
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 빠른 작업 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">빠른 작업</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.link}>
              <div className={`${action.color} text-white p-4 rounded-lg text-center transition-all duration-200 hover:scale-105`}>
                <div className="text-2xl mb-2">{action.icon}</div>
                <h3 className="font-semibold mb-1">{action.title}</h3>
                <p className="text-sm opacity-90">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 시스템 상태 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">시스템 상태</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-2">
              <span className="text-green-600 text-xl">✓</span>
            </div>
            <p className="text-sm font-medium text-gray-900">시스템 상태</p>
            <p className="text-xs text-green-600">정상 동작</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-2">
              <span className="text-blue-600 text-xl">📊</span>
            </div>
            <p className="text-sm font-medium text-gray-900">데이터베이스</p>
            <p className="text-xs text-blue-600">H2 인메모리</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-2">
              <span className="text-purple-600 text-xl">🌐</span>
            </div>
            <p className="text-sm font-medium text-gray-900">서브도메인</p>
            <p className="text-xs text-purple-600">{dashboardStats.totalTeams}개 활성</p>
          </div>
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