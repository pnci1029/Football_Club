import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card } from '../../components/common';
import { adminTeamService, AdminTeam } from '../../services/adminTeamService';
import { adminService, StadiumDto } from '../../services/adminService';
import TeamEditModal from '../../components/admin/TeamEditModal';
import StadiumCreateModal from '../../components/admin/StadiumCreateModal';
import StadiumEditModal from '../../components/admin/StadiumEditModal';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';

const AdminTeamDetail: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  
  const [team, setTeam] = useState<AdminTeam | null>(null);
  const [stadiums, setStadiums] = useState<StadiumDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateStadiumModal, setShowCreateStadiumModal] = useState(false);
  const [showEditStadiumModal, setShowEditStadiumModal] = useState(false);
  const [editingStadium, setEditingStadium] = useState<StadiumDto | null>(null);
  const [showDeleteStadiumModal, setShowDeleteStadiumModal] = useState(false);
  const [deletingStadium, setDeletingStadium] = useState<StadiumDto | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (teamId) {
      loadTeamDetails();
      loadTeamStadiums();
    }
  }, [teamId]);

  const loadTeamDetails = async () => {
    try {
      setLoading(true);
      const response = await adminTeamService.getTeam(parseInt(teamId!));
      if (response.success) {
        setTeam(response.data);
      } else {
        console.error('Failed to load team details');
      }
    } catch (error) {
      console.error('Error loading team details:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTeamStadiums = async () => {
    try {
      const response = await adminService.getStadiumsByTeam(parseInt(teamId!), 0, 100);
      setStadiums(response.content);
    } catch (error) {
      console.error('Error loading team stadiums:', error);
    }
  };

  const handleEditTeam = () => {
    setShowEditModal(true);
  };

  const handleTeamUpdated = () => {
    loadTeamDetails();
  };

  const handleCreateStadium = () => {
    setShowCreateStadiumModal(true);
  };

  const handleStadiumCreated = () => {
    loadTeamStadiums();
  };

  const handleEditStadium = (stadium: StadiumDto) => {
    setEditingStadium(stadium);
    setShowEditStadiumModal(true);
  };

  const handleStadiumUpdated = () => {
    loadTeamStadiums();
  };

  const handleDeleteStadium = (stadium: StadiumDto) => {
    setDeletingStadium(stadium);
    setShowDeleteStadiumModal(true);
  };

  const confirmDeleteStadium = async () => {
    if (!deletingStadium) return;
    
    setDeleteLoading(true);
    try {
      // adminStadiumService.deleteStadium 호출
      // const response = await adminStadiumService.deleteStadium(deletingStadium.id);
      // if (response.success) {
        loadTeamStadiums();
        setShowDeleteStadiumModal(false);
        setDeletingStadium(null);
      // }
    } catch (error) {
      console.error('Failed to delete stadium:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleViewPlayers = () => {
    navigate(`/admin/players?teamId=${teamId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🏆</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">팀을 찾을 수 없습니다</h3>
        <Button onClick={() => navigate('/admin/teams')}>팀 목록으로 돌아가기</Button>
      </div>
    );
  }

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
            팀 목록
          </Button>
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-green-600 mr-4 flex items-center justify-center">
              {team.logoUrl ? (
                <img 
                  src={team.logoUrl}
                  alt={`${team.name} 로고`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-xl font-bold">{team.code}</span>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{team.name}</h1>
              <p className="text-gray-600 mt-1">{team.description}</p>
              <div className="flex items-center mt-2">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium mr-2">
                  {team.code}
                </span>
                <span className="text-gray-500 text-sm">
                  생성일: {new Date(team.createdAt).toLocaleDateString('ko-KR')}
                </span>
              </div>
            </div>
          </div>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={handleEditTeam}
        >
          <span className="mr-2">✏️</span>
          팀 정보 수정
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{team.playerCount || 0}</div>
            <div className="text-sm text-gray-600">소속 선수</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stadiums.length}</div>
            <div className="text-sm text-gray-600">보유 구장</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-gray-600">예정 경기</div>
          </div>
        </Card>
      </div>

      {/* 액션 버튼들 */}
      <div className="flex gap-3">
        <Button 
          className="bg-green-600 hover:bg-green-700"
          onClick={handleViewPlayers}
        >
          <span className="mr-2">👥</span>
          선수 관리
        </Button>
        <Button 
          className="bg-purple-600 hover:bg-purple-700"
          onClick={handleCreateStadium}
        >
          <span className="mr-2">🏟️</span>
          구장 추가
        </Button>
        <Button 
          variant="outline"
          className="text-orange-600 border-orange-200 hover:bg-orange-50"
          onClick={() => navigate(`/admin/hero-slides/${teamId}`)}
        >
          <span className="mr-2">🎬</span>
          슬라이드 관리
        </Button>
      </div>

      {/* 구장 목록 */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">보유 구장</h2>
          <Button
            size="sm"
            className="bg-purple-600 hover:bg-purple-700"
            onClick={handleCreateStadium}
          >
            <span className="mr-1">➕</span>
            구장 추가
          </Button>
        </div>

        {stadiums.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stadiums.map((stadium) => (
              <div key={stadium.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="mb-3">
                  <h3 className="font-bold text-gray-900 mb-1">{stadium.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{stadium.address}</p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>시간당: {stadium.hourlyRate?.toLocaleString()}원</span>
                    <span>{stadium.availableHours}</span>
                  </div>
                </div>
                
                {stadium.facilities && stadium.facilities.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {stadium.facilities.slice(0, 3).map((facility, index) => (
                        <span 
                          key={index}
                          className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs"
                        >
                          {facility}
                        </span>
                      ))}
                      {stadium.facilities.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{stadium.facilities.length - 3}개
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
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
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">🏟️</div>
            <p className="text-gray-600 mb-4">등록된 구장이 없습니다</p>
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={handleCreateStadium}
            >
              <span className="mr-2">➕</span>
              첫 번째 구장 추가하기
            </Button>
          </div>
        )}
      </Card>

      {/* 팀 수정 모달 */}
      <TeamEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        team={team}
        onTeamUpdated={handleTeamUpdated}
      />

      {/* 구장 생성 모달 */}
      <StadiumCreateModal
        isOpen={showCreateStadiumModal}
        onClose={() => setShowCreateStadiumModal(false)}
        onStadiumCreated={handleStadiumCreated}
        teamId={parseInt(teamId!)}
      />

      {/* 구장 수정 모달 */}
      <StadiumEditModal
        isOpen={showEditStadiumModal}
        onClose={() => setShowEditStadiumModal(false)}
        stadium={editingStadium}
        onStadiumUpdated={handleStadiumUpdated}
      />

      {/* 구장 삭제 확인 모달 */}
      <ConfirmDeleteModal
        isOpen={showDeleteStadiumModal}
        onClose={() => {
          setShowDeleteStadiumModal(false);
          setDeletingStadium(null);
        }}
        onConfirm={confirmDeleteStadium}
        title="구장 삭제"
        itemName={deletingStadium?.name || ''}
        itemType="구장"
        loading={deleteLoading}
      />
    </div>
  );
};

export default AdminTeamDetail;