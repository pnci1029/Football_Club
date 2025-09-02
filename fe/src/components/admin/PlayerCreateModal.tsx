import React from 'react';
import Modal from '../common/Modal';
import { Button } from '../common';
import ImageUpload from '../common/ImageUpload';
import { CreatePlayerRequest, adminPlayerService } from '../../services/adminPlayerService';
import { useFormState } from '../../utils/form';
import { FORM_STYLES, ALERT_STYLES } from '../../constants/styles';
import { ERROR_MESSAGES, LOADING_MESSAGES } from '../../constants/messages';
import { Logger } from '../../utils/logger';

interface PlayerCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: number | null;
  onPlayerCreated: () => void;
}

const PlayerCreateModal: React.FC<PlayerCreateModalProps> = ({
  isOpen,
  onClose,
  teamId,
  onPlayerCreated
}) => {
  const initialFormData: CreatePlayerRequest = {
    name: '',
    position: '',
    backNumber: 1,
    isActive: true,
    profileImageUrl: ''
  };
  
  const { formData, setFormData, loading, error, setError, handleChange, setLoading, resetForm } = useFormState(initialFormData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId) return;

    setLoading(true);
    setError('');

    try {
      const response = await adminPlayerService.createPlayer(teamId, formData);
      if (response.success) {
        onPlayerCreated();
        onClose();
        // Reset form
        setFormData({
          name: '',
          position: '',
          backNumber: 1,
          isActive: true,
          profileImageUrl: ''
        });
      } else {
        setError(response.message || ERROR_MESSAGES.CREATE_FAILED);
      }
    } catch (err) {
      setError(ERROR_MESSAGES.CREATE_FAILED);
      Logger.error('Create player error:', err);
    } finally {
      setLoading(false);
    }
  };


  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="새 선수 추가"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className={ALERT_STYLES.ERROR}>
            {error}
          </div>
        )}

        {/* 선수 이름 */}
        <div>
          <label className={FORM_STYLES.LABEL}>
            선수 이름 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={FORM_STYLES.INPUT}
            placeholder="선수 이름을 입력하세요"
            required
          />
        </div>

        {/* 포지션 */}
        <div>
          <label className={FORM_STYLES.LABEL}>
            포지션 <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.position}
            onChange={(e) => handleChange('position', e.target.value)}
            className={FORM_STYLES.INPUT}
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
          <label className={FORM_STYLES.LABEL}>
            등번호 <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.backNumber}
            onChange={(e) => handleChange('backNumber', parseInt(e.target.value) || 1)}
            className={FORM_STYLES.INPUT}
            placeholder="등번호를 입력하세요"
            min="1"
            max="99"
            required
          />
        </div>

        {/* 프로필 이미지 */}
        <div>
          <label className={FORM_STYLES.LABEL}>
            프로필 이미지
          </label>
          <ImageUpload
            value={formData.profileImageUrl}
            onChange={(imageUrl) => handleChange('profileImageUrl', imageUrl)}
            onError={(errorMsg) => setError(errorMsg)}
            placeholder="선수 프로필 이미지를 업로드하세요"
            className="w-full max-w-xs mx-auto"
          />
          {formData.profileImageUrl && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">업로드된 이미지:</p>
              <input
                type="url"
                value={formData.profileImageUrl}
                onChange={(e) => handleChange('profileImageUrl', e.target.value)}
                className={`${FORM_STYLES.INPUT} text-sm`}
                placeholder="직접 URL 입력도 가능합니다"
              />
            </div>
          )}
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
            {loading ? LOADING_MESSAGES.CREATING : '생성'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default PlayerCreateModal;