import React from 'react';

const PlayerCardSkeleton: React.FC = React.memo(() => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 animate-pulse">
      {/* 프로필 이미지 스켈레톤 */}
      <div className="w-full aspect-[3/4] bg-gray-200 rounded-t-lg"></div>
      
      {/* 선수 정보 스켈레톤 */}
      <div className="p-3 sm:p-4 space-y-2">
        {/* 이름 */}
        <div className="h-4 sm:h-5 bg-gray-200 rounded w-3/4"></div>
        
        {/* 포지션과 번호 */}
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-8"></div>
        </div>
      </div>
    </div>
  );
});

PlayerCardSkeleton.displayName = 'PlayerCardSkeleton';

export default PlayerCardSkeleton;