import React, { useState } from 'react';
import { Button, Card } from '../../components/common';

interface Player {
  id: number;
  name: string;
  position: string;
  backNumber: number;
  team: string;
  isActive: boolean;
  profileImageUrl?: string;
}

const AdminPlayers: React.FC = () => {
  const [players] = useState<Player[]>([
    { id: 1, name: '김철수', position: 'FW', backNumber: 10, team: 'FC 서울', isActive: true },
    { id: 2, name: '이영희', position: 'MF', backNumber: 8, team: 'FC 서울', isActive: true },
    { id: 3, name: '박민수', position: 'DF', backNumber: 4, team: 'FC 부산', isActive: false },
    { id: 4, name: '최지은', position: 'GK', backNumber: 1, team: 'FC 인천', isActive: true },
  ]);

  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.team.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'active' && player.isActive) ||
                         (selectedFilter === 'inactive' && !player.isActive);
    return matchesSearch && matchesFilter;
  });

  const getPositionBadgeColor = (position: string) => {
    switch (position) {
      case 'GK': return 'bg-yellow-100 text-yellow-800';
      case 'DF': return 'bg-blue-100 text-blue-800';
      case 'MF': return 'bg-green-100 text-green-800';
      case 'FW': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">선수 관리</h1>
          <p className="text-gray-600 mt-2">등록된 선수들을 관리합니다</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <span className="mr-2">➕</span>
          선수 추가
        </Button>
      </div>

      {/* 필터 및 검색 */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="선수명 또는 팀명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">전체</option>
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
            </select>
          </div>
        </div>
      </Card>

      {/* 선수 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPlayers.map((player) => (
          <Card key={player.id} className="hover:shadow-lg transition-shadow duration-200">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-gray-100 mb-4">
                <img 
                  src={player.profileImageUrl || `https://via.placeholder.com/400x400/e5e7eb/9ca3af?text=${player.name.charAt(0)}`}
                  alt={`${player.name} 프로필`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{player.name}</h3>
              
              <div className="flex justify-center items-center gap-2 mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPositionBadgeColor(player.position)}`}>
                  {player.position}
                </span>
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                  #{player.backNumber}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{player.team}</p>
              
              <div className="flex justify-center mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  player.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {player.isActive ? '활성' : '비활성'}
                </span>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  수정
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                >
                  삭제
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredPlayers.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👤</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">선수가 없습니다</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? '검색 조건에 맞는 선수가 없습니다.' : '등록된 선수가 없습니다.'}
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <span className="mr-2">➕</span>
              첫 번째 선수 추가하기
            </Button>
          </div>
        </Card>
      )}

      {/* 하단 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{players.length}</div>
            <div className="text-sm text-gray-600">총 선수</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {players.filter(p => p.isActive).length}
            </div>
            <div className="text-sm text-gray-600">활성 선수</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {players.filter(p => !p.isActive).length}
            </div>
            <div className="text-sm text-gray-600">비활성 선수</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {new Set(players.map(p => p.team)).size}
            </div>
            <div className="text-sm text-gray-600">소속 팀</div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminPlayers;