import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, Card } from '../../components/common';
import { adminStadiumService, AdminStadium, CreateStadiumRequest } from '../../services/adminStadiumService';
import { adminService, TeamStats } from '../../services/adminService';

const AdminStadiums: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [stadiums, setStadiums] = useState<AdminStadium[]>([]);
  const [teams, setTeams] = useState<TeamStats[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const teamId = searchParams.get('teamId');
    if (teamId) {
      setSelectedTeamId(parseInt(teamId));
    }
    
    const fetchTeams = async () => {
      try {
        const dashboardStats = await adminService.getDashboardStats();
        setTeams(dashboardStats.teams);
      } catch (error) {
        console.error('팀 목록 로딩 실패:', error);
      }
    };
    
    fetchTeams();
  }, [searchParams]);

  useEffect(() => {
    loadStadiums();
  }, [page, selectedTeamId]);

  const loadStadiums = async () => {
    setLoading(true);
    try {
      let result;
      if (selectedTeamId) {
        result = await adminService.getStadiumsByTeam(selectedTeamId, page, 10);
      } else {
        result = await adminService.getAllStadiums(page, 10);
      }
      setStadiums(result.content);
      setTotalPages(Math.ceil(result.totalElements / 10));
    } catch (error) {
      console.error('Failed to load stadiums:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStadium = async (id: number) => {
    try {
      const response = await adminStadiumService.deleteStadium(id);
      if (response.success) {
        loadStadiums();
      }
    } catch (error) {
      console.error('Failed to delete stadium:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadStadiums();
      return;
    }

    setLoading(true);
    try {
      const response = await adminStadiumService.searchStadiumsByName(searchTerm);
      if (response.success) {
        setStadiums(response.data);
      }
    } catch (error) {
      console.error('Failed to search stadiums:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm) {
        handleSearch();
      } else {
        loadStadiums();
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleTeamChange = (teamId: number | null) => {
    setSelectedTeamId(teamId);
    setPage(0);
    
    if (teamId) {
      setSearchParams({ teamId: teamId.toString() });
    } else {
      setSearchParams({});
    }
  };

  const selectedTeam = teams.find(team => team.id === selectedTeamId);

  const filteredStadiums = stadiums.filter(stadium =>
    stadium.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stadium.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">구장 관리</h1>
          <p className="text-gray-600 mt-2">
            {selectedTeam ? `${selectedTeam.name} 소속 구장들을 관리합니다` : '등록된 구장들을 관리합니다'}
          </p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <span className="mr-2">➕</span>
          구장 추가
        </Button>
      </div>

      {/* 팀 필터 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">팀 필터</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleTeamChange(null)}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              selectedTeamId === null
                ? 'bg-purple-500 text-white border-purple-500'
                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
            }`}
          >
            전체 구장
          </button>
          {teams.map((team) => (
            <button
              key={team.id}
              onClick={() => handleTeamChange(team.id)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                selectedTeamId === team.id
                  ? 'bg-purple-500 text-white border-purple-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
            >
              {team.name} ({team.stadiumCount})
            </button>
          ))}
        </div>
      </div>

      {/* 검색 */}
      <Card>
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="구장명 또는 주소로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </Card>

      {/* 구장 목록 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredStadiums.map((stadium) => (
          <Card key={stadium.id} className="hover:shadow-lg transition-shadow duration-200">
            <div className="mb-4">
              <div className="w-full h-32 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg mb-4 flex items-center justify-center">
                {stadium.imageUrls.length > 0 ? (
                  <img 
                    src={stadium.imageUrls[0]}
                    alt={`${stadium.name}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-white text-4xl">🏟️</span>
                )}
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2">{stadium.name}</h3>
              <p className="text-gray-600 text-sm mb-3">{stadium.address}</p>
            </div>

            {/* 구장 정보 */}
            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">시간당 요금:</span>
                <span className="font-medium text-gray-900">{formatCurrency(stadium.hourlyRate)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">이용 시간:</span>
                <span className="font-medium text-gray-900">{stadium.availableHours}</span>
              </div>
              {stadium.contactNumber && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">연락처:</span>
                  <span className="font-medium text-gray-900">{stadium.contactNumber}</span>
                </div>
              )}
            </div>

            {/* 시설 */}
            <div className="mb-4">
              <span className="text-sm text-gray-600 block mb-2">시설:</span>
              <div className="flex flex-wrap gap-1">
                {stadium.facilities.map((facility, index) => (
                  <span 
                    key={index}
                    className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs"
                  >
                    {facility}
                  </span>
                ))}
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1 text-purple-600 border-purple-200 hover:bg-purple-50"
              >
                <span className="mr-1">📍</span>
                지도 보기
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
                onClick={() => handleDeleteStadium(stadium.id)}
              >
                🗑️
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredStadiums.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏟️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">구장이 없습니다</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? '검색 조건에 맞는 구장이 없습니다.' : '등록된 구장이 없습니다.'}
            </p>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <span className="mr-2">➕</span>
              첫 번째 구장 추가하기
            </Button>
          </div>
        </Card>
      )}

      {/* 하단 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stadiums.length}</div>
            <div className="text-sm text-gray-600">총 구장 수</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(Math.round(stadiums.reduce((total, stadium) => total + stadium.hourlyRate, 0) / stadiums.length) || 0)}
            </div>
            <div className="text-sm text-gray-600">평균 시간당 요금</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stadiums.filter(s => s.facilities.includes('주차장')).length}
            </div>
            <div className="text-sm text-gray-600">주차장 보유</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stadiums.filter(s => s.facilities.includes('조명')).length}
            </div>
            <div className="text-sm text-gray-600">조명 시설</div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminStadiums;