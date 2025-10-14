import React from 'react';
import { CardProps } from '../../types/components/common';

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'md',
  rounded = 'lg',
  hover = false,
  onClick
}) => {
  const baseClasses = 'bg-white border border-gray-200 transition-all duration-200';
  
  const paddingClasses = {
    none: '',
    sm: 'p-3 sm:p-3', // 모바일 최적화된 패딩
    md: 'p-3 sm:p-4', // 모바일에서는 더 작은 패딩
    lg: 'p-4 sm:p-6'  // 모바일에서는 더 작은 패딩
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-card',
    lg: 'shadow-soft'
  };

  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl'
  };

  const hoverClasses = hover ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer touch-manipulation active:scale-[0.98]' : '';
  const clickableClasses = onClick ? 'cursor-pointer touch-manipulation' : '';

  const combinedClasses = `${baseClasses} ${paddingClasses[padding]} ${shadowClasses[shadow]} ${roundedClasses[rounded]} ${hoverClasses} ${clickableClasses} ${className}`;

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div className={combinedClasses} onClick={handleClick}>
      {children}
    </div>
  );
};

export default Card;