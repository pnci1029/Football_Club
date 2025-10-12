import React, { useState } from 'react';
import { Modal } from '../common';
import { useTeam } from '../../contexts/TeamContext';
import { adminPlayerApi, CreatePlayerRequest } from '../../api/modules/adminPlayer';

interface PlayerCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface PlayerFormData {
  name: string;
  position: string;
  backNumber: number | '';
  profileImageUrl: string;
  isActive: boolean;
}

const PlayerCreateModal: React.FC<PlayerCreateModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { currentTeam } = useTeam();
  const [formData, setFormData] = useState<PlayerFormData>({
    name: '',
    position: 'FW',
    backNumber: '',
    profileImageUrl: '',
    isActive: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const positions = [
    { value: 'GK', label: '골키퍼 (GK)' },
    { value: 'DF', label: '수비수 (DF)' },
    { value: 'MF', label: '미드필더 (MF)' },
    { value: 'FW', label: '공격수 (FW)' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const playerData: CreatePlayerRequest = {
        name: formData.name,
        position: formData.position,
        backNumber: formData.backNumber === '' ? undefined : Number(formData.backNumber),
        profileImageUrl: formData.profileImageUrl || undefined,
        isActive: formData.isActive
      };

      if (!currentTeam) {
        throw new Error('팀 정보를 찾을 수 없습니다.');
      }

      await adminPlayerApi.createPlayer(parseInt(currentTeam.id), playerData);

      onSuccess();
      handleClose();
    } catch (error) {
      console.error('선수 등록 실패:', error);
      setError('선수 등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      position: 'FW',
      backNumber: '',
      profileImageUrl: '',
      isActive: true
    });
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="선수 등록">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            선수명 *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="선수명을 입력하세요"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            포지션 *
          </label>
          <select
            value={formData.position}
            onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isLoading}
          >
            {positions.map(pos => (
              <option key={pos.value} value={pos.value}>
                {pos.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            등번호
          </label>
          <input
            type="number"
            value={formData.backNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, backNumber: e.target.value === '' ? '' : Number(e.target.value) }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="등번호를 입력하세요"
            min="1"
            max="99"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            프로필 이미지 URL
          </label>
          <input
            type="url"
            value={formData.profileImageUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, profileImageUrl: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="이미지 URL을 입력하세요"
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            disabled={isLoading}
          />
          <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
            활성 상태
          </label>
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            disabled={isLoading}
          >
            취소
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? '등록 중...' : '등록'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PlayerCreateModal;