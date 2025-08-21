import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/common';

const AdminDashboard: React.FC = () => {
  const stats = [
    {
      title: '총 선수',
      value: '25',
      icon: '👤',
      color: 'bg-blue-500',
      link: '/admin/players'
    },
    {
      title: '총 팀',
      value: '8',
      icon: '🏆',
      color: 'bg-green-500',
      link: '/admin/teams'
    },
    {
      title: '총 구장',
      value: '12',
      icon: '🏟️',
      color: 'bg-purple-500',
      link: '/admin/stadiums'
    },
    {
      title: '이번 달 경기',
      value: '6',
      icon: '⚽',
      color: 'bg-orange-500',
      link: '/admin/matches'
    }
  ];

  const quickActions = [
    {
      title: '선수 추가',
      description: '새로운 선수를 팀에 등록합니다',
      icon: '➕',
      color: 'bg-blue-500 hover:bg-blue-600',
      link: '/admin/players/new'
    },
    {
      title: '팀 생성',
      description: '새로운 팀을 생성합니다',
      icon: '🆕',
      color: 'bg-green-500 hover:bg-green-600',
      link: '/admin/teams/new'
    },
    {
      title: '구장 등록',
      description: '새로운 구장을 시스템에 등록합니다',
      icon: '🏗️',
      color: 'bg-purple-500 hover:bg-purple-600',
      link: '/admin/stadiums/new'
    },
    {
      title: '경기 일정 관리',
      description: '경기 일정을 생성하고 관리합니다',
      icon: '📅',
      color: 'bg-orange-500 hover:bg-orange-600',
      link: '/admin/matches/new'
    }
  ];

  const recentActivities = [
    { action: '새로운 선수 "김철수" 등록', time: '2시간 전', type: 'player' },
    { action: '구장 "서울 스타디움" 정보 수정', time: '4시간 전', type: 'stadium' },
    { action: '팀 "FC 서울" 생성', time: '6시간 전', type: 'team' },
    { action: '경기 일정 "FC 서울 vs FC 부산" 생성', time: '1일 전', type: 'match' },
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

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
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