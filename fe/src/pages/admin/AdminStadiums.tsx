import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button, Card } from '../../components/common';
import { adminStadiumService } from '../../services/adminStadiumService';
import { adminService } from '../../services/adminService';
import { TeamStats, StadiumDto } from '../../types/interfaces/admin/index';
import StadiumCreateModal from '../../components/admin/StadiumCreateModal';
import StadiumEditModal from '../../components/admin/StadiumEditModal';
import StadiumMapModal from '../../components/admin/StadiumMapModal';
import { getApiBaseUrl } from '../../utils/config';

const AdminStadiums: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [stadiums, setStadiums] = useState<StadiumDto[]>([]);
  const [teams, setTeams] = useState<TeamStats[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStadium, setEditingStadium] = useState<StadiumDto | null>(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapStadium, setMapStadium] = useState<StadiumDto | null>(null);

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
  }, [page, selectedTeamId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadStadiums = async () => {
    try {
      let result;
      if (selectedTeamId) {
        result = await adminService.getStadiumsByTeam(selectedTeamId, page, 10);
      } else {
        result = await adminService.getAllStadiums(page, 10);
      }
      setStadiums(result.content);
    } catch (error) {
      console.error('Failed to load stadiums:', error);
    }
  };

  const handleDeleteStadium = async (stadium: StadiumDto) => {
    const confirmed = window.confirm(`"${stadium.name}" 구장을 정말 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`);

    if (!confirmed) {
      return;
    }

    try {
      
      const response = await fetch(`${getApiBaseUrl()}/api/v1/admin/stadiums/${stadium.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-Host': window.location.host
        }
      });

      const result = await response.json();

      if (result.success) {
        alert('삭제 성공!');
        await loadStadiums();
      } else {
        alert('삭제 실패: ' + (result.message || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('DELETE error:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };



  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadStadiums();
      return;
    }

    try {
      const response = await adminStadiumService.searchStadiumsByName(searchTerm);
      if (response.success) {
        setStadiums(response.data);
      }
    } catch (error) {
      console.error('Failed to search stadiums:', error);
    }
  };

  const handleViewMap = (stadium: StadiumDto) => {
    setMapStadium(stadium);
    setShowMapModal(true);
  };

  const handleEditStadium = (stadium: StadiumDto) => {
    setEditingStadium(stadium);
    setShowEditModal(true);
  };

  const handleCreateStadium = () => {
    setShowCreateModal(true);
  };

  const handleStadiumCreated = () => {
    loadStadiums();
  };

  const handleStadiumUpdated = () => {
    loadStadiums();
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
  }, [searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

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
        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/teams')}
            className="mr-4 text-gray-600 border-gray-300 hover:bg-gray-50"
          >
            <span className="mr-1">←</span>
            팀 관리로 돌아가기
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">구장 관리</h1>
            <p className="text-gray-600 mt-2">
              {selectedTeam ? `${selectedTeam.name} 소속 구장들을 관리합니다` : '등록된 구장들을 관리합니다'}
            </p>
          </div>
        </div>
        <Button
          className="bg-purple-600 hover:bg-purple-700"
          onClick={handleCreateStadium}
        >
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
                {stadium.imageUrls && stadium.imageUrls.length > 0 ? (
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
                {stadium.facilities && stadium.facilities.map((facility, index) => (
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
                onClick={() => handleViewMap(stadium)}
              >
                <span className="mr-1">📍</span>
                지도 보기
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                onClick={() => handleEditStadium(stadium)}
              >
                <span className="mr-1">✏️</span>
                수정
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => handleDeleteStadium(stadium)}
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
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={handleCreateStadium}
            >
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
              {stadiums.filter(s => s.facilities && s.facilities.includes('주차장')).length}
            </div>
            <div className="text-sm text-gray-600">주차장 보유</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stadiums.filter(s => s.facilities && s.facilities.includes('조명')).length}
            </div>
            <div className="text-sm text-gray-600">조명 시설</div>
          </div>
        </Card>
      </div>



      {/* 구장 생성 모달 */}
      <StadiumCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onStadiumCreated={handleStadiumCreated}
        teamId={selectedTeamId || undefined}
      />

      {/* 구장 수정 모달 */}
      <StadiumEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        stadium={editingStadium}
        onStadiumUpdated={handleStadiumUpdated}
      />

      {/* 구장 위치 지도 모달 */}
      <StadiumMapModal
        isOpen={showMapModal}
        onClose={() => {
          setShowMapModal(false);
          setMapStadium(null);
        }}
        stadium={mapStadium}
      />
    </div>
  );
};

export default AdminStadiums;
