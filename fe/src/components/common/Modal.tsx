import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-full max-w-sm sm:max-w-md lg:max-w-[400px]',
    md: 'w-full max-w-md sm:max-w-lg lg:max-w-[480px]', 
    lg: 'w-full max-w-lg sm:max-w-xl lg:max-w-[600px]',
    xl: 'w-full max-w-xl sm:max-w-2xl lg:max-w-[800px]'
  };

  // 모바일에서 바디 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Mobile-first layout */}
      <div className="flex items-end sm:items-center justify-center min-h-screen p-0 sm:p-4">
        {/* Background overlay - 모바일 최적화 */}
        <div 
          className="fixed inset-0 transition-opacity bg-black bg-opacity-50 sm:bg-gray-500 sm:bg-opacity-75"
          onClick={onClose}
        />

        {/* Center modal - 모바일 최적화 */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        <div className={`relative sm:inline-block bg-white rounded-t-2xl sm:rounded-lg shadow-xl transform transition-all duration-300 ease-in-out
          h-auto max-h-[90vh] sm:max-h-[85vh] overflow-hidden
          sm:align-middle sm:my-8 ${sizeClasses[size]}`}>
          {/* Header - 모바일 최적화 */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
            {/* Mobile drag indicator */}
            <div className="sm:hidden absolute top-2 left-1/2 transform -translate-x-1/2">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
            </div>
            
            <h3 className="text-lg sm:text-xl leading-6 font-semibold text-gray-900 pt-2 sm:pt-0">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors touch-manipulation"
              aria-label="닫기"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body - 모바일 최적화 */}
          <div className="px-4 py-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-80px)] sm:max-h-[calc(85vh-80px)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;