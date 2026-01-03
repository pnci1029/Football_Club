import React from 'react';
import GalleryCard from './GalleryCard';
import GalleryCardSkeleton from './GalleryCardSkeleton';
import { Gallery } from '../../types/gallery';

interface GalleryGridProps {
  galleries: Gallery[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  isAdmin?: boolean;
  onEdit?: (gallery: Gallery) => void;
  onDelete?: (gallery: Gallery) => void;
}

const GalleryGrid: React.FC<GalleryGridProps> = ({ 
  galleries, 
  isLoading, 
  hasMore, 
  onLoadMore,
  isAdmin = false,
  onEdit,
  onDelete
}) => {
  return (
    <div>
      {/* 갤러리 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {(galleries || []).map((gallery, index) => (
          <div
            key={gallery.id}
            className="transform hover:scale-105 transition-all duration-300 relative group"
            style={{
              animationDelay: `${index * 100}ms`,
              animation: 'fadeInUp 0.6s ease-out forwards'
            }}
          >
            <GalleryCard gallery={gallery} />
            
            {/* 관리자용 버튼들 */}
            {isAdmin && (
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(gallery);
                  }}
                  className="bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                  title="갤러리 수정"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(gallery);
                  }}
                  className="bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700 transition-colors"
                  title="갤러리 삭제"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}
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