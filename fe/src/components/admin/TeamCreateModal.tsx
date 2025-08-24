import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Button } from '../common';
import { CreateTeamRequest, adminTeamService } from '../../services/adminTeamService';

interface TeamCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTeamCreated: () => void;
}

const TeamCreateModal: React.FC<TeamCreateModalProps> = ({
  isOpen,
  onClose,
  onTeamCreated
}) => {
  const [formData, setFormData] = useState<CreateTeamRequest>({
    code: '',
    name: '',
    description: '',
    logoUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      const response = await adminTeamService.createTeam(formData);
      if (response.success) {
        onTeamCreated();
        onClose();
        // Reset form
        setFormData({
          code: '',
          name: '',
          description: '',
          logoUrl: ''
        });
      } else {
        setError(response.message || '팀 생성에 실패했습니다.');
      }
    } catch (err) {
      setError('팀 생성 중 오류가 발생했습니다.');
      console.error('Create team error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CreateTeamRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClose = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      logoUrl: ''
    });
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="새 팀 생성"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* 팀 코드 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            팀 코드 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.code}
            onChange={(e) => handleChange('code', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="팀 코드를 입력하세요 (예: teamA)"
            required
            pattern="[a-zA-Z0-9-_]+"
            title="영문, 숫자, 하이픈(-), 언더스코어(_)만 사용 가능합니다"
          />
          <p className="text-xs text-gray-500 mt-1">
            서브도메인으로 사용됩니다. 영문, 숫자, 하이픈(-), 언더스코어(_)만 사용 가능
          </p>
        </div>

        {/* 팀 이름 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            팀 이름 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="팀 이름을 입력하세요"
            required
          />
        </div>

        {/* 팀 설명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            팀 설명
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="팀에 대한 설명을 입력하세요"
          />
        </div>

        {/* 로고 URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            로고 URL
          </label>
          <input
            type="url"
            value={formData.logoUrl}
            onChange={(e) => handleChange('logoUrl', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://example.com/logo.png"
          />
        </div>

        {/* 버튼 */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
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
            {loading ? '생성 중...' : '생성'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TeamCreateModal;