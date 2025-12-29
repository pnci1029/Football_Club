import React from 'react';
import { Link } from 'react-router-dom';
import { Gallery, GalleryCategory, MediaType, PlayType } from '../../types/gallery';

interface GalleryCardProps {
  gallery: Gallery;
}

const GalleryCard: React.FC<GalleryCardProps> = ({ gallery }) => {
  const coverMedia = gallery.mediaFiles.find(media => media.isCover) || gallery.mediaFiles[0];
  const mediaCount = gallery.mediaFiles.length;
  const hasVideo = gallery.mediaFiles.some(media => media.mediaType === MediaType.VIDEO);

  const getCategoryLabel = (category: GalleryCategory): string => {
    const categoryLabels = {
      [GalleryCategory.MATCH]: '경기',
      [GalleryCategory.TRAINING]: '훈련',
      [GalleryCategory.EVENT]: '이벤트',
      [GalleryCategory.PLAYER]: '선수',
      [GalleryCategory.FACILITY]: '시설',
      [GalleryCategory.ACHIEVEMENT]: '성취',
      [GalleryCategory.HIGHLIGHT]: '하이라이트',
      [GalleryCategory.ETC]: '기타'
    };
    return categoryLabels[category] || category;
  };

  const getCategoryColor = (category: GalleryCategory): string => {
    const categoryColors = {
      [GalleryCategory.MATCH]: 'bg-red-100 text-red-800',
      [GalleryCategory.TRAINING]: 'bg-blue-100 text-blue-800',
      [GalleryCategory.EVENT]: 'bg-green-100 text-green-800',
      [GalleryCategory.PLAYER]: 'bg-purple-100 text-purple-800',
      [GalleryCategory.FACILITY]: 'bg-yellow-100 text-yellow-800',
      [GalleryCategory.ACHIEVEMENT]: 'bg-orange-100 text-orange-800',
      [GalleryCategory.HIGHLIGHT]: 'bg-pink-100 text-pink-800',
      [GalleryCategory.ETC]: 'bg-gray-100 text-gray-800'
    };
    return categoryColors[category] || 'bg-gray-100 text-gray-800';
  };

  const getPlayTypeLabel = (playType: PlayType): string => {
    const playTypeLabels = {
      [PlayType.GOAL]: '골',
      [PlayType.ASSIST]: '어시스트',
      [PlayType.SAVE]: '세이브',
      [PlayType.TACKLE]: '태클',
      [PlayType.PASS]: '패스',
      [PlayType.SHOT]: '슛',
      [PlayType.FOUL]: '파울',
      [PlayType.CARD]: '카드',
      [PlayType.SUBSTITUTION]: '교체',
      [PlayType.ETC]: '기타'
    };
    return playTypeLabels[playType] || playType;
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Link to={`/gallery/${gallery.id}`}>
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
        {/* 이미지/썸네일 */}
        <div className="relative aspect-video bg-gray-100">
          {coverMedia ? (
            <>
              <img
                src={coverMedia.thumbnailUrl || coverMedia.fileUrl}
                alt={gallery.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {/* 미디어 타입 표시 */}
              <div className="absolute top-2 left-2 flex gap-2">
                {hasVideo && (
                  <span className="bg-black bg-opacity-70 text-white px-2 py-1 text-xs rounded-md flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    VIDEO
                  </span>
                )}
                {mediaCount > 1 && (
                  <span className="bg-black bg-opacity-70 text-white px-2 py-1 text-xs rounded-md flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-11.5-6L8 7v10l2.5-3L12 16l2.5-2L17 17V7l-2.5 3L12 8l-1.5 2z"/>
                    </svg>
                    {mediaCount}
                  </span>
                )}
              </div>
              
              {/* 조회수 */}
              <div className="absolute top-2 right-2">
                <span className="bg-black bg-opacity-70 text-white px-2 py-1 text-xs rounded-md flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                  {gallery.viewCount}
                </span>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
            </div>
          )}
        </div>

        {/* 컨텐츠 */}
        <div className="p-4">
          {/* 카테고리와 하이라이트 정보 */}
          <div className="flex items-center justify-between mb-2">
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-md ${getCategoryColor(gallery.category)}`}>
              {getCategoryLabel(gallery.category)}
            </span>
            
            {gallery.highlightMetadata && (
              <div className="flex items-center text-xs text-gray-600">
                <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded-md mr-2">
                  {getPlayTypeLabel(gallery.highlightMetadata.playType)}
                </span>
                <div className="flex items-center">
                  <svg className="w-3 h-3 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  {gallery.highlightMetadata.highlightRating}/5
                </div>
              </div>
            )}
          </div>

          {/* 제목 */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
            {gallery.title}
          </h3>

          {/* 설명 */}
          {gallery.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {gallery.description}
            </p>
          )}

          {/* 태그 */}
          {gallery.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {gallery.tags.slice(0, 3).map(tag => (
                <span
                  key={tag.id}
                  className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md"
                  style={{ backgroundColor: tag.color ? `${tag.color}20` : undefined }}
                >
                  #{tag.tagName}
                </span>
              ))}
              {gallery.tags.length > 3 && (
                <span className="inline-block text-gray-500 text-xs">
                  +{gallery.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* 날짜 */}
          <div className="text-xs text-gray-500">
            {formatDate(gallery.createdAt)}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default GalleryCard;