import React from 'react';

const HeroSectionSkeleton: React.FC = React.memo(() => {
  return (
    <div className="relative text-white py-16 sm:py-20 lg:py-24 overflow-hidden">
      {/* 배경 그라데이션 */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-400 to-gray-500 animate-pulse">
        <div className="absolute inset-0 bg-black opacity-20"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* 제목 스켈레톤 */}
          <div className="h-8 sm:h-12 md:h-16 lg:h-20 bg-white bg-opacity-20 rounded-lg mb-3 sm:mb-4 lg:mb-6 animate-pulse"></div>
          
          {/* 부제목 스켈레톤 */}
          <div className="h-4 sm:h-6 md:h-7 lg:h-8 bg-white bg-opacity-15 rounded-lg mb-6 sm:mb-8 animate-pulse max-w-2xl mx-auto"></div>
          
          {/* 슬라이드 인디케이터 스켈레톤 */}
          <div className="flex justify-center space-x-2 sm:space-x-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white bg-opacity-30 rounded-full animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

HeroSectionSkeleton.displayName = 'HeroSectionSkeleton';

export default HeroSectionSkeleton;