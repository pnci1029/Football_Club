import React from 'react';

const GalleryCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
      {/* 이미지 스켈레톤 */}
      <div className="aspect-video bg-gray-200"></div>

      {/* 컨텐츠 스켈레톤 */}
      <div className="p-4">
        {/* 카테고리 */}
        <div className="flex items-center justify-between mb-2">
          <div className="h-5 bg-gray-200 rounded-md w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>

        {/* 제목 */}
        <div className="space-y-2 mb-2">
          <div className="h-5 bg-gray-200 rounded w-full"></div>
          <div className="h-5 bg-gray-200 rounded w-3/4"></div>
        </div>

        {/* 설명 */}
        <div className="space-y-1 mb-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>

        {/* 태그들 */}
        <div className="flex flex-wrap gap-1 mb-3">
          <div className="h-5 bg-gray-200 rounded-md w-12"></div>
          <div className="h-5 bg-gray-200 rounded-md w-16"></div>
          <div className="h-5 bg-gray-200 rounded-md w-10"></div>
        </div>

        {/* 날짜 */}
        <div className="h-3 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
  );
};

export default GalleryCardSkeleton;