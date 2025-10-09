import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card } from '../../components/common';
import { adminTeamService, AdminTeam } from '../../services/adminTeamService';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import TeamEditModal from '../../components/admin/TeamEditModal';
import TeamCreateModal from '../../components/admin/TeamCreateModal';
import QRCodeModal from '../../components/admin/QRCodeModal';
import { useToast } from '../../components/Toast';

const AdminTeams: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: showError, ToastContainer } = useToast();
  const [teams, setTeams] = useState<AdminTeam[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingTeam, setDeletingTeam] = useState<AdminTeam | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<AdminTeam | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrTeam, setQrTeam] = useState<AdminTeam | null>(null);

  useEffect(() => {
    loadTeams();
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadTeams = async () => {
    try {
      const response = await adminTeamService.getAllTeams(page, 10);
      if (response.success) {
        setTeams(response.data.content);
      }
    } catch (error) {
      console.error('Failed to load teams:', error);
    }
  };

  const handleDeleteTeam = (team: AdminTeam) => {
    setDeletingTeam(team);
    setShowDeleteModal(true);
  };

  const confirmDeleteTeam = async () => {
    if (!deletingTeam) return;
    
    setDeleteLoading(true);
    try {
      const response = await adminTeamService.deleteTeam(deletingTeam.id);
      if (response.success) {
        success('팀이 삭제되었습니다.');
        loadTeams();
        setShowDeleteModal(false);
        setDeletingTeam(null);
      } else {
        showError('삭제에 실패했습니다. 다시 시도해 주세요.');
      }
    } catch (error) {
      console.error('Failed to delete team:', error);
      showError('삭제 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleViewPlayers = (team: AdminTeam) => {
    navigate(`/admin/players?teamId=${team.id}`);
  };

  const handleViewStadiums = (team: AdminTeam) => {
    navigate(`/admin/teams/stadiums?teamId=${team.id}`);
  };

  const handleViewTeamDetail = (team: AdminTeam) => {
    navigate(`/admin/teams/${team.id}`);
  };

  const handleEditTeam = (team: AdminTeam) => {
    setEditingTeam(team);
    setShowEditModal(true);
  };

  const handleCreateTeam = () => {
    setShowCreateModal(true);
  };

  const handleShowQR = (team: AdminTeam) => {
    setQrTeam(team);
    setShowQRModal(true);
  };

  const handleTeamUpdated = () => {
    loadTeams();
  };

  const handleTeamCreated = () => {
    loadTeams();
  };

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
        <div className="flex items-center gap-3">
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={handleCreateTeam}
          >
            <span className="mr-2">➕</span>
            팀 추가
          </Button>
        </div>
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
            <div 
              className="text-center mb-4 cursor-pointer"
              onClick={() => handleViewTeamDetail(team)}
            >
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
              
              <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-green-600 transition-colors">
                {team.name}
              </h3>
              
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
                <span className="font-medium text-gray-900">{team.playerCount || 0}명</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">생성일:</span>
                <span className="font-medium text-gray-900">
                  {new Date(team.createdAt).toLocaleDateString('ko-KR')}
                </span>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="flex gap-2 mb-3">
              <Button 
                size="sm" 
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                onClick={() => handleViewTeamDetail(team)}
              >
                <span className="mr-1">👁️</span>
                상세 보기
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                onClick={() => handleEditTeam(team)}
              >
                <span className="mr-1">✏️</span>
                수정
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => handleDeleteTeam(team)}
              >
                🗑️
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-purple-600 border-purple-200 hover:bg-purple-50"
                onClick={() => handleShowQR(team)}
              >
                <span className="mr-1">📱</span>
                QR 코드
              </Button>
              <Link
                to={`/hero-slides/${team.id}`}
                className="flex-1"
              >
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-orange-600 border-orange-200 hover:bg-orange-50"
                >
                  <span className="mr-1">🎬</span>
                  슬라이드
                </Button>
              </Link>
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
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={handleCreateTeam}
            >
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
              {teams.reduce((total, team) => total + (team.playerCount || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">총 선수 수</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {teams.length > 0 ? Math.round(teams.reduce((total, team) => total + (team.playerCount || 0), 0) / teams.length) : 0}
            </div>
            <div className="text-sm text-gray-600">평균 선수 수</div>
          </div>
        </Card>
      </div>

      {/* 삭제 확인 모달 */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingTeam(null);
        }}
        onConfirm={confirmDeleteTeam}
        title="팀 삭제"
        itemName={deletingTeam?.name || ''}
        itemType="팀"
        loading={deleteLoading}
      />

      {/* 팀 생성 모달 */}
      <TeamCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onTeamCreated={handleTeamCreated}
      />

      {/* 팀 수정 모달 */}
      <TeamEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        team={editingTeam}
        onTeamUpdated={handleTeamUpdated}
      />

      {/* QR 코드 모달 */}
      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => {
          setShowQRModal(false);
          setQrTeam(null);
        }}
        teamName={qrTeam?.name || ''}
        teamCode={qrTeam?.code || ''}
      />

      <ToastContainer />
    </div>
  );
};

export default AdminTeams;