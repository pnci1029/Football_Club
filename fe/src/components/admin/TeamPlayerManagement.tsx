import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card } from '../../components/common';
import { adminPlayerService, AdminPlayer } from '../../services/adminPlayerService';
import PlayerEditModal from './PlayerEditModal';
import PlayerCreateModal from './PlayerCreateModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { ImageUtil } from '../../utils/image';
import { useToast } from '../Toast';

interface TeamPlayerManagementProps {
  teamId: number;
}

const TeamPlayerManagement: React.FC<TeamPlayerManagementProps> = ({ teamId }) => {
  const { success, error: showError, ToastContainer } = useToast();
  const [players, setPlayers] = useState<AdminPlayer[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');
  const [page] = useState(0);
  const [editingPlayer, setEditingPlayer] = useState<AdminPlayer | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPlayer, setDeletingPlayer] = useState<AdminPlayer | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadPlayers = useCallback(async () => {
    try {
      const response = await adminPlayerService.getAllPlayers(page, 10, teamId, debouncedSearchTerm);
      if (response.success && response.data) {
        setPlayers(response.data.content || []);
      }
    } catch (error) {
      console.error('Failed to load players:', error);
    }
  }, [teamId, page, debouncedSearchTerm]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    loadPlayers();
  }, [loadPlayers]);

  const handleDeletePlayer = (player: AdminPlayer) => {
    setDeletingPlayer(player);
    setShowDeleteModal(true);
  };

  const confirmDeletePlayer = async () => {
    if (!deletingPlayer) return;

    setDeleteLoading(true);
    try {
      const response = await adminPlayerService.deletePlayer(deletingPlayer.id);
      if (response.success) {
        success('선수가 삭제되었습니다.');
        loadPlayers();
        setShowDeleteModal(false);
        setDeletingPlayer(null);
      } else {
        showError('삭제에 실패했습니다. 다시 시도해 주세요.');
      }
    } catch (error) {
      console.error('Failed to delete player:', error);
      showError('삭제 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditPlayer = (player: AdminPlayer) => {
    setEditingPlayer(player);
    setShowEditModal(true);
  };

  const handleCreatePlayer = () => {
    setShowCreateModal(true);
  };

  const handlePlayerUpdated = () => {
    success('선수 정보가 수정되었습니다.');
    loadPlayers();
  };

  const handlePlayerCreated = () => {
    success('새 선수가 추가되었습니다.');
    loadPlayers();
  };

  const filteredPlayers = (players || []).filter(player => {
    if (!player) return false;

    const matchesFilter = selectedFilter === 'all' ||
                         (selectedFilter === 'active' && player.isActive) ||
                         (selectedFilter === 'inactive' && !player.isActive);
    return matchesFilter;
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
          <h2 className="text-2xl font-bold text-gray-900">선수 관리</h2>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={handleCreatePlayer}
        >
          선수 추가
        </Button>
      </div>

      {/* 필터 및 검색 */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="선수명으로 검색..."
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
                  src={ImageUtil.createSafeImageSrc(player.profileImageUrl, () => ImageUtil.createPlayerProfile(player.name || 'Player'))}
                  alt={`${player.name || '선수'} 프로필`}
                  className="w-full h-full object-contain"
                />
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">{player.name || '이름 없음'}</h3>

              <div className="flex justify-center items-center gap-2 mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPositionBadgeColor(player.position || '')}`}>
                  {player.position || 'N/A'}
                </span>
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                  #{player.backNumber || 0}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-3">{player.team?.name || '팀 미지정'}</p>

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
                  onClick={() => handleEditPlayer(player)}
                >
                  수정
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => handleDeletePlayer(player)}
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
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleCreatePlayer}
            >
              첫 번째 선수 추가하기
            </Button>
          </div>
        </Card>
      )}

      {/* 모달들 */}
      <PlayerCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handlePlayerCreated}
        teamId={teamId}
      />

      <PlayerEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        player={editingPlayer ? {
          id: editingPlayer.id,
          name: editingPlayer.name,
          position: editingPlayer.position,
          backNumber: editingPlayer.backNumber,
          profileImageUrl: editingPlayer.profileImageUrl,
          isActive: editingPlayer.isActive,
          teamId: editingPlayer.team.id,
          teamName: editingPlayer.team.name
        } : null}
        onSuccess={handlePlayerUpdated}
      />

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingPlayer(null);
        }}
        onConfirm={confirmDeletePlayer}
        title="선수 삭제"
        itemName={deletingPlayer?.name || ''}
        itemType="선수"
        loading={deleteLoading}
      />

      <ToastContainer />
    </div>
  );
};

export default TeamPlayerManagement;
