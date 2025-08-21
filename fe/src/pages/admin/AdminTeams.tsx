import React, { useState } from 'react';
import { Button, Card } from '../../components/common';

interface Team {
  id: number;
  code: string;
  name: string;
  description: string;
  logoUrl?: string;
  playerCount: number;
  createdAt: string;
}

const AdminTeams: React.FC = () => {
  const [teams] = useState<Team[]>([
    {
      id: 1,
      code: 'SEL',
      name: 'FC 서울',
      description: '서울을 대표하는 축구 클럽',
      playerCount: 12,
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      code: 'BSN',
      name: 'FC 부산',
      description: '부산의 열정적인 축구팀',
      playerCount: 8,
      createdAt: '2024-02-20'
    },
    {
      id: 3,
      code: 'ICN',
      name: 'FC 인천',
      description: '인천 지역의 강력한 팀',
      playerCount: 5,
      createdAt: '2024-03-10'
    },
  ]);

  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">팀 관리</h1>
          <p className="text-gray-600 mt-2">등록된 팀들을 관리합니다</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <span className="mr-2">➕</span>
          팀 추가
        </Button>
      </div>

      {/* 검색 */}
      <Card>
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="팀명, 코드 또는 설명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </Card>

      {/* 팀 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeams.map((team) => (
          <Card key={team.id} className="hover:shadow-lg transition-shadow duration-200">
            <div className="text-center mb-4">
              <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-green-600 mb-4 flex items-center justify-center">
                {team.logoUrl ? (
                  <img 
                    src={team.logoUrl}
                    alt={`${team.name} 로고`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-2xl font-bold">{team.code}</span>
                )}
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">{team.name}</h3>
              
              <div className="flex justify-center mb-3">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {team.code}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {team.description}
              </p>
            </div>

            {/* 팀 정보 */}
            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">소속 선수:</span>
                <span className="font-medium text-gray-900">{team.playerCount}명</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">생성일:</span>
                <span className="font-medium text-gray-900">
                  {new Date(team.createdAt).toLocaleDateString('ko-KR')}
                </span>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1 text-green-600 border-green-200 hover:bg-green-50"
              >
                <span className="mr-1">👥</span>
                선수 보기
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <span className="mr-1">✏️</span>
                수정
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                🗑️
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredTeams.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏆</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">팀이 없습니다</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? '검색 조건에 맞는 팀이 없습니다.' : '등록된 팀이 없습니다.'}
            </p>
            <Button className="bg-green-600 hover:bg-green-700">
              <span className="mr-2">➕</span>
              첫 번째 팀 추가하기
            </Button>
          </div>
        </Card>
      )}

      {/* 하단 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{teams.length}</div>
            <div className="text-sm text-gray-600">총 팀 수</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {teams.reduce((total, team) => total + team.playerCount, 0)}
            </div>
            <div className="text-sm text-gray-600">총 선수 수</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {teams.length > 0 ? Math.round(teams.reduce((total, team) => total + team.playerCount, 0) / teams.length) : 0}
            </div>
            <div className="text-sm text-gray-600">평균 선수 수</div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminTeams;