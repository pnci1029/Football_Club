import React from 'react';
import Modal from '../common/Modal';
import { Button } from '../common';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  itemName: string;
  itemType: string; // "선수", "팀", "구장" 등
  loading?: boolean;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  itemType,
  loading = false
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="md"
    >
      <div className="space-y-4">
        {/* 경고 아이콘 및 메시지 */}
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900">
              {itemType} 삭제 확인
            </h3>
            <p className="text-sm text-gray-500">
              이 작업은 되돌릴 수 없습니다.
            </p>
          </div>
        </div>

        {/* 상세 메시지 */}
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-800">
            <p className="font-medium mb-2">다음 {itemType}을(를) 삭제하시겠습니까?</p>
            <p className="font-bold text-red-900">"{itemName}"</p>
            
            <div className="mt-3 space-y-1">
              <p>• 모든 관련 데이터가 삭제됩니다</p>
              <p>• 이 작업은 복구할 수 없습니다</p>
              <p>• 신중하게 결정해 주세요</p>
            </div>
          </div>
        </div>

        {/* 확인 입력 */}
        <div className="bg-gray-50 rounded-md p-4">
          <p className="text-sm text-gray-700 mb-2">
            정말로 삭제하시려면 아래 버튼을 클릭하세요:
          </p>
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
            type="button"
            variant="primary"
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 focus:ring-red-500"
            disabled={loading}
          >
            {loading ? '삭제 중...' : '삭제'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDeleteModal;