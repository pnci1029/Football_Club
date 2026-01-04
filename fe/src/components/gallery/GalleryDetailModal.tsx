import React, { useState, useEffect } from 'react';
import { GalleryDetailDto, MediaType, PlayType } from '../../types/gallery';
import { galleryService } from '../../services/galleryAPI';
import LoadingSpinner from '../common/LoadingSpinner';
import Modal from '../common/Modal';

interface GalleryDetailModalProps {
  galleryId: number;
  isOpen: boolean;
  onClose: () => void;
}

const GalleryDetailModal: React.FC<GalleryDetailModalProps> = ({
  galleryId,
  isOpen,
  onClose
}) => {
  const [gallery, setGallery] = useState<GalleryDetailDto | null>(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && galleryId) {
      loadGalleryDetail();
    }
  }, [isOpen, galleryId]);

  const loadGalleryDetail = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await galleryService.getGallery(galleryId);
      setGallery(data as GalleryDetailDto);
      setCurrentMediaIndex(0);
    } catch (err) {
      setError('갤러리를 불러오는데 실패했습니다.');
      console.error('갤러리 로드 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const nextMedia = () => {
    if (gallery && currentMediaIndex < gallery.mediaFiles.length - 1) {
      setCurrentMediaIndex(currentMediaIndex + 1);
    }
  };

  const previousMedia = () => {
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex(currentMediaIndex - 1);
    }
  };

  const goToMedia = (index: number) => {
    setCurrentMediaIndex(index);
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      MATCH: '⚽',
      TRAINING: '🏃‍♂️',
      EVENT: '🎉',
      PLAYER: '👤',
      FACILITY: '🏟️',
      ACHIEVEMENT: '🏆',
      HIGHLIGHT: '⭐',
      ETC: '📷'
    };
    return icons[category as keyof typeof icons] || '📷';
  };

  const getPlayTypeIcon = (playType: PlayType) => {
    const icons = {
      GOAL: '⚽',
      ASSIST: '👟',
      SAVE: '🥅',
      TACKLE: '🛡️',
      SKILL: '✨',
      TEAM_PLAY: '🤝',
      CARD: '🟨',
      CELEBRATION: '🎉',
      FOUL: '⚠️',
      FREE_KICK: '🦶',
      CORNER_KICK: '📐',
      PENALTY: '⚽',
      OTHER: '⭐'
    };
    return icons[playType] || '⭐';
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="갤러리 상세" size="xl">
      <div className="max-h-[90vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">😞</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">오류가 발생했습니다</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadGalleryDetail}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        ) : gallery ? (
          <div>
            {/* Header */}
            <div className="border-b border-gray-200 pb-4 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getCategoryIcon(gallery.category)}</span>
                    <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                      {gallery.categoryDisplayName}
                    </span>
                    {gallery.isFeatured && (
                      <span className="text-sm font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                        ⭐ 추천
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{gallery.title}</h1>
                  {gallery.description && (
                    <p className="text-gray-600 mb-3">{gallery.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>📅 {new Date(gallery.createdAt).toLocaleDateString()}</span>
                    <span>👁️ {gallery.viewCount.toLocaleString()}회</span>
                    <span>📸 {gallery.mediaFiles.length}개</span>
                    {gallery.createdBy && <span>✏️ {gallery.createdBy}</span>}
                  </div>
                </div>
              </div>

              {/* Tags */}
              {gallery.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {gallery.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Highlight Metadata */}
              {gallery.highlightMetadata && (
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <span>{getPlayTypeIcon(gallery.highlightMetadata.playType)}</span>
                    하이라이트 정보
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">플레이 유형:</span>
                      <p className="font-medium">{gallery.highlightMetadata.playTypeDisplayName}</p>
                    </div>
                    {gallery.highlightMetadata.playerNames && (
                      <div>
                        <span className="text-gray-500">관련 선수:</span>
                        <p className="font-medium">{gallery.highlightMetadata.playerNames}</p>
                      </div>
                    )}
                    {gallery.highlightMetadata.gameMinuteFormatted && (
                      <div>
                        <span className="text-gray-500">경기 시간:</span>
                        <p className="font-medium">{gallery.highlightMetadata.gameMinuteFormatted}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">평점:</span>
                      <p className="font-medium">
                        {'⭐'.repeat(gallery.highlightMetadata.highlightRating)} 
                        ({gallery.highlightMetadata.highlightRating}/5)
                      </p>
                    </div>
                  </div>
                  {gallery.highlightMetadata.description && (
                    <div className="mt-3">
                      <span className="text-gray-500">설명:</span>
                      <p className="text-gray-800 mt-1">{gallery.highlightMetadata.description}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Media Viewer */}
            {gallery.mediaFiles.length > 0 && (
              <div className="mb-6">
                <div className="relative bg-black rounded-lg overflow-hidden mb-4">
                  <div className="aspect-video flex items-center justify-center">
                    {gallery.mediaFiles[currentMediaIndex].mediaType === MediaType.IMAGE ? (
                      <img
                        src={gallery.mediaFiles[currentMediaIndex].fileUrl}
                        alt={gallery.mediaFiles[currentMediaIndex].fileName}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <video
                        src={gallery.mediaFiles[currentMediaIndex].fileUrl}
                        controls
                        className="max-w-full max-h-full"
                        poster={gallery.mediaFiles[currentMediaIndex].thumbnailUrl}
                      />
                    )}
                  </div>

                  {/* Navigation Arrows */}
                  {gallery.mediaFiles.length > 1 && (
                    <>
                      <button
                        onClick={previousMedia}
                        disabled={currentMediaIndex === 0}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={nextMedia}
                        disabled={currentMediaIndex === gallery.mediaFiles.length - 1}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}

                  {/* Media Counter */}
                  {gallery.mediaFiles.length > 1 && (
                    <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                      {currentMediaIndex + 1} / {gallery.mediaFiles.length}
                    </div>
                  )}
                </div>

                {/* Media Info */}
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-4">
                    <span>
                      {gallery.mediaFiles[currentMediaIndex].mediaType === MediaType.IMAGE ? '📷' : '🎬'} 
                      {gallery.mediaFiles[currentMediaIndex].originalFileName}
                    </span>
                    <span>📏 {gallery.mediaFiles[currentMediaIndex].fileSizeFormatted}</span>
                    {gallery.mediaFiles[currentMediaIndex].durationFormatted && (
                      <span>⏱️ {gallery.mediaFiles[currentMediaIndex].durationFormatted}</span>
                    )}
                  </div>
                  <span>📅 {new Date(gallery.mediaFiles[currentMediaIndex].uploadedAt).toLocaleDateString()}</span>
                </div>

                {/* Thumbnail Gallery */}
                {gallery.mediaFiles.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {gallery.mediaFiles.map((media, index) => (
                      <button
                        key={media.id}
                        onClick={() => goToMedia(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          index === currentMediaIndex
                            ? 'border-blue-500 ring-2 ring-blue-200'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center relative">
                          {media.mediaType === MediaType.IMAGE ? (
                            <img
                              src={media.thumbnailUrl || media.fileUrl}
                              alt={media.fileName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <>
                              {media.thumbnailUrl ? (
                                <img
                                  src={media.thumbnailUrl}
                                  alt={media.fileName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="text-gray-400">🎬</div>
                              )}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-6 h-6 bg-black bg-opacity-60 rounded-full flex items-center justify-center">
                                  <svg className="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M8 5v10l8-5z" />
                                  </svg>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {gallery.mediaFiles.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📷</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">미디어 파일이 없습니다</h3>
                <p className="text-gray-600">이 갤러리에는 아직 업로드된 사진이나 영상이 없습니다.</p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </Modal>
  );
};

export default GalleryDetailModal;