import React from 'react';
import { Gallery } from '../../types/gallery';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';

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
  isAdmin,
  onEdit,
  onDelete
}) => {
  const navigate = useNavigate();

  const handleGalleryClick = (gallery: Gallery) => {
    navigate(`/gallery/${gallery.id}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
  };

  return (
    <>
      {/* 갤러리 리스트 헤더 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
            <div className="col-span-1">번호</div>
            <div className="col-span-6">제목</div>
            <div className="col-span-2">카테고리</div>
            <div className="col-span-2">작성일</div>
            <div className="col-span-1">조회수</div>
          </div>
        </div>

        {/* 갤러리 리스트 */}
        <div className="divide-y divide-gray-200">
          {galleries.map((gallery, index) => (
            <div
              key={gallery.id}
              className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => handleGalleryClick(gallery)}
            >
              <div className="grid grid-cols-12 gap-4 items-center text-sm">
                <div className="col-span-1 text-gray-500">
                  {galleries.length - index}
                </div>
                <div className="col-span-6">
                  <div className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
                    {gallery.title}
                  </div>
                  {gallery.description && (
                    <div className="text-gray-500 text-xs mt-1 truncate">
                      {gallery.description}
                    </div>
                  )}
                  {gallery.tags && gallery.tags.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {gallery.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700"
                        >
                          {tag}
                        </span>
                      ))}
                      {gallery.tags.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{gallery.tags.length - 3}개
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="col-span-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                    {gallery.categoryDisplayName}
                  </span>
                </div>
                <div className="col-span-2 text-gray-500">
                  {formatDate(gallery.createdAt)}
                </div>
                <div className="col-span-1 text-gray-500">
                  {gallery.viewCount}
                </div>
              </div>

              {/* 관리자 버튼 */}
              {isAdmin && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit?.(gallery);
                    }}
                    className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-200 transition-colors"
                  >
                    수정
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.(gallery);
                    }}
                    className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>


      {/* 더 보기 버튼 */}
      {hasMore && !isLoading && galleries.length > 0 && (
        <div className="text-center mt-8">
          <button
            onClick={onLoadMore}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
          >
            더 보기
          </button>
        </div>
      )}

      {/* 추가 로딩 표시 */}
      {isLoading && galleries.length > 0 && (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      )}

    </>
  );
};

export default GalleryGrid;