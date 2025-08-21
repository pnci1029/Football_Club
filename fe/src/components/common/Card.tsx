import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  onClick?: () => void;
}

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
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
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

  const hoverClasses = hover ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';

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