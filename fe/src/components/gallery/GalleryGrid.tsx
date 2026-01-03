import React from 'react';
import GalleryCard from './GalleryCard';
import GalleryCardSkeleton from './GalleryCardSkeleton';
import { Gallery } from '../../types/gallery';

interface GalleryGridProps {
  galleries: Gallery[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

const GalleryGrid: React.FC<GalleryGridProps> = ({ 
  galleries, 
  isLoading, 
  hasMore, 
  onLoadMore 
}) => {
  return (
    <div>
      {/* 갤러리 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {(galleries || []).map((gallery, index) => (
          <div
            key={gallery.id}
            className="transform hover:scale-105 transition-all duration-300"
            style={{
              animationDelay: `${index * 100}ms`,
              animation: 'fadeInUp 0.6s ease-out forwards'
            }}
          >
            <GalleryCard gallery={gallery} />
          </div>
        ))}

        {/* 로딩 스켈레톤 */}
        {isLoading && (
          <>
            {Array.from({ length: 8 }).map((_, index) => (
              <GalleryCardSkeleton key={`skeleton-${index}`} />
            ))}
          </>
        )}
      </div>

      {/* 더보기 버튼 */}
      {hasMore && !isLoading && (galleries || []).length > 0 && (
        <div className="text-center">
          <button
            onClick={onLoadMore}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300 font-medium shadow-md hover:shadow-lg"
          >
            더보기
          </button>
        </div>
      )}

      {/* 마지막 페이지 메시지 */}
      {!hasMore && (galleries || []).length > 0 && (
        <div className="text-center text-gray-500 py-8">
          모든 갤러리를 확인했습니다
        </div>
      )}
    </div>
  );
};

export default GalleryGrid;