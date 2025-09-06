import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 sm:w-4 sm:h-4', // 모바일에서도 동일한 크기
    md: 'w-5 h-5 sm:w-6 sm:h-6', // 모바일에서 약간 작게
    lg: 'w-6 h-6 sm:w-8 sm:h-8', // 모바일에서 작게
    xl: 'w-8 h-8 sm:w-12 sm:h-12' // 모바일에서 훨씬 작게
  };

  const colorClasses = {
    primary: 'text-primary-600',
    secondary: 'text-secondary-600',
    white: 'text-white',
    gray: 'text-gray-600'
  };

  const spinnerClasses = `animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`;

  return (
    <svg
      className={spinnerClasses}
      fill="none"
      viewBox="0 0 24 24"
      data-testid="loading-spinner"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="m4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  spinnerSize?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  children,
  spinnerSize = 'lg',
  message = '로딩 중...'
}) => {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-90 sm:bg-opacity-75 flex flex-col items-center justify-center z-50 p-4">
          <LoadingSpinner size={spinnerSize} />
          {message && (
            <p className="mt-3 sm:mt-4 text-gray-600 text-sm sm:text-sm font-medium text-center px-4">
              {message}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;