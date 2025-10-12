import React, { useState, useEffect } from 'react';
import { Modal } from '../common';
import { adminNoticeApi, AdminUpdateNoticeRequest } from '../../api/modules/adminNotice';
import type { Notice } from '../../api/types';
import { useTeam } from '../../contexts/TeamContext';

interface NoticeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  notice: Notice | null;
}

interface NoticeFormData {
  title: string;
  content: string;
  isGlobalVisible: boolean;
}

const NoticeEditModal: React.FC<NoticeEditModalProps> = ({ isOpen, onClose, onSuccess, notice }) => {
  const { currentTeam } = useTeam();
  const [formData, setFormData] = useState<NoticeFormData>({
    title: '',
    content: '',
    isGlobalVisible: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (notice) {
      setFormData({
        title: notice.title,
        content: notice.content,
        isGlobalVisible: notice.isGlobalVisible || false
      });
    }
  }, [notice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeam || !notice) {
      setError('팀 정보 또는 공지사항 정보를 찾을 수 없습니다.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const requestData: AdminUpdateNoticeRequest = {
        ...formData,
        teamId: parseInt(currentTeam.id)
      };

      await adminNoticeApi.updateNotice(notice.id, requestData);
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('공지사항 수정 실패:', error);
      setError('공지사항 수정에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="공지사항 수정">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            제목 *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="공지사항 제목을 입력하세요"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            내용 *
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="공지사항 내용을 입력하세요"
            rows={6}
            required
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="editIsGlobalVisible"
            checked={formData.isGlobalVisible}
            onChange={(e) => setFormData(prev => ({ ...prev, isGlobalVisible: e.target.checked }))}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            disabled={isLoading}
          />
          <label htmlFor="editIsGlobalVisible" className="ml-2 text-sm text-gray-700">
            전체 공개 (모든 팀에서 볼 수 있습니다)
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
            {isLoading ? '수정 중...' : '수정'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default NoticeEditModal;