import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Button } from '../common';
import { adminPlayerApi, UpdatePlayerRequest } from '../../api/modules/adminPlayer';
import type { PlayerDto } from '../../types/player';

interface PlayerEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: PlayerDto | null;
  onSuccess: () => void;
}

const PlayerEditModal: React.FC<PlayerEditModalProps> = ({
  isOpen,
  onClose,
  player,
  onSuccess
}) => {
  const [formData, setFormData] = useState<UpdatePlayerRequest>({
    name: '',
    position: '',
    backNumber: undefined,
    isActive: true,
    profileImageUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (player) {
      setFormData({
        name: player.name || '',
        position: player.position || '',
        backNumber: player.backNumber || undefined,
        isActive: player.isActive ?? true,
        profileImageUrl: player.profileImageUrl || ''
      });
      setError('');
    }
  }, [player]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!player) return;

    setLoading(true);
    setError('');

    try {
      await adminPlayerApi.updatePlayer(player.id, formData);
      onSuccess();
      onClose();
    } catch (err) {
      setError('선수 정보 수정 중 오류가 발생했습니다.');
      console.error('Update player error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof UpdatePlayerRequest, value: string | number | boolean | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="선수 정보 수정"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* 선수 이름 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            선수 이름 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="선수 이름을 입력하세요"
            required
          />
        </div>

        {/* 포지션 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            포지션 <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.position}
            onChange={(e) => handleChange('position', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">포지션 선택</option>
            <option value="GK">골키퍼 (GK)</option>
            <option value="DF">수비수 (DF)</option>
            <option value="MF">미드필더 (MF)</option>
            <option value="FW">공격수 (FW)</option>
          </select>
        </div>

        {/* 등번호 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            등번호 <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.backNumber || ''}
            onChange={(e) => handleChange('backNumber', e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="등번호를 입력하세요"
            min="1"
            max="99"
          />
        </div>

        {/* 프로필 이미지 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            프로필 이미지 URL
          </label>
          <input
            type="url"
            value={formData.profileImageUrl || ''}
            onChange={(e) => handleChange('profileImageUrl', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="이미지 URL을 입력하세요"
          />
        </div>

        {/* 활성 상태 */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => handleChange('isActive', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm text-gray-700">활성 선수</span>
          </label>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
          >
            취소
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? '저장 중...' : '저장'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default PlayerEditModal;