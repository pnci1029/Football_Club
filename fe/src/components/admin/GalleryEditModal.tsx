import React, { useState, useEffect } from 'react';
import { galleryAPI } from '../../services/galleryAPI';
import { Gallery, GalleryDetailDto, GalleryCategory, PlayType, UpdateGalleryRequest } from '../../types/gallery';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';

interface GalleryEditModalProps {
  gallery: Gallery;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const GalleryEditModal: React.FC<GalleryEditModalProps> = ({
  gallery,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [galleryDetail, setGalleryDetail] = useState<GalleryDetailDto | null>(null);
  const [formData, setFormData] = useState({
    title: gallery.title,
    description: gallery.description || '',
    category: gallery.category,
    tags: gallery.tags.join(', '),
    // 하이라이트 메타데이터
    isHighlight: false,
    playType: PlayType.GOAL,
    playerNames: '',
    gameMinute: '',
    highlightRating: 3,
    highlightDescription: ''
  });

  const categories = [
    { value: GalleryCategory.MATCH, label: '경기' },
    { value: GalleryCategory.TRAINING, label: '훈련' },
    { value: GalleryCategory.EVENT, label: '이벤트' },
    { value: GalleryCategory.PLAYER, label: '선수' },
    { value: GalleryCategory.FACILITY, label: '시설' },
    { value: GalleryCategory.ACHIEVEMENT, label: '성취' },
    { value: GalleryCategory.HIGHLIGHT, label: '하이라이트' },
    { value: GalleryCategory.ETC, label: '기타' }
  ];

  const playTypes = [
    { value: PlayType.GOAL, label: '골' },
    { value: PlayType.ASSIST, label: '어시스트' },
    { value: PlayType.SAVE, label: '선방' },
    { value: PlayType.TACKLE, label: '태클' },
    { value: PlayType.SKILL, label: '개인기' },
    { value: PlayType.TEAM_PLAY, label: '팀플레이' },
    { value: PlayType.CARD, label: '카드' },
    { value: PlayType.CELEBRATION, label: '세리머니' },
    { value: PlayType.FOUL, label: '파울' },
    { value: PlayType.FREE_KICK, label: '프리킥' },
    { value: PlayType.CORNER_KICK, label: '코너킥' },
    { value: PlayType.PENALTY, label: '페널티킥' },
    { value: PlayType.OTHER, label: '기타' }
  ];

  useEffect(() => {
    if (isOpen) {
      loadGalleryDetail();
    }
  }, [isOpen, gallery.id]);

  const loadGalleryDetail = async () => {
    try {
      const detail = await galleryAPI.getGallery(gallery.id);
      setGalleryDetail(detail);
      
      // 하이라이트 메타데이터가 있으면 폼에 반영
      if (detail.highlightMetadata) {
        setFormData(prev => ({
          ...prev,
          isHighlight: true,
          playType: detail.highlightMetadata!.playType,
          playerNames: detail.highlightMetadata!.playerNames || '',
          gameMinute: detail.highlightMetadata!.gameMinute?.toString() || '',
          highlightRating: detail.highlightMetadata!.highlightRating,
          highlightDescription: detail.highlightMetadata!.description || ''
        }));
      }
    } catch (error) {
      console.error('갤러리 상세 정보 로드 실패:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // 하이라이트 카테고리 선택 시 자동으로 하이라이트 메타데이터 활성화
    if (field === 'category' && value === GalleryCategory.HIGHLIGHT) {
      setFormData(prev => ({
        ...prev,
        isHighlight: true
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      window.alert('제목을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const updateRequest: UpdateGalleryRequest = {
        title: formData.title,
        description: formData.description || undefined,
        category: formData.category,
        tags: tags.length > 0 ? tags : undefined,
        highlightMetadata: formData.isHighlight && (formData.category === GalleryCategory.HIGHLIGHT || galleryDetail?.highlightMetadata) ? {
          playType: formData.playType,
          playerNames: formData.playerNames || undefined,
          gameMinute: formData.gameMinute ? parseInt(formData.gameMinute) : undefined,
          highlightRating: formData.highlightRating,
          description: formData.highlightDescription || undefined
        } : undefined
      };

      await galleryAPI.updateGallery(gallery.id, updateRequest);
      onSuccess();
    } catch (error) {
      console.error('갤러리 수정 실패:', error);
      window.alert('갤러리 수정에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMedia = async (mediaId: number) => {
    if (!window.confirm('이 미디어 파일을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await galleryAPI.deleteMediaFile(gallery.id, mediaId);
      await loadGalleryDetail(); // 갤러리 상세 정보 다시 로드
    } catch (error) {
      console.error('미디어 파일 삭제 실패:', error);
      window.alert('미디어 파일 삭제에 실패했습니다.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="갤러리 수정" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">갤러리 수정</h2>
          <p className="text-gray-600">갤러리 정보를 수정하거나 미디어를 관리하세요</p>
        </div>

        {/* 기본 정보 */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">태그</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="태그를 쉼표로 구분해서 입력"
              />
            </div>
          </div>
        </div>

        {/* 하이라이트 메타데이터 */}
        {(formData.category === GalleryCategory.HIGHLIGHT || galleryDetail?.highlightMetadata || formData.isHighlight) && (
          <div className="border-t pt-6">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="isHighlight"
                checked={formData.isHighlight}
                onChange={(e) => handleInputChange('isHighlight', e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="isHighlight" className="ml-2 text-sm font-medium text-gray-700">
                하이라이트 정보
              </label>
            </div>

            {formData.isHighlight && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">플레이 유형</label>
                    <select
                      value={formData.playType}
                      onChange={(e) => handleInputChange('playType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      {playTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">관련 선수</label>
                    <input
                      type="text"
                      value={formData.playerNames}
                      onChange={(e) => handleInputChange('playerNames', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="선수 이름"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">경기 시간(분)</label>
                    <input
                      type="number"
                      value={formData.gameMinute}
                      onChange={(e) => handleInputChange('gameMinute', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      max="120"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">하이라이트 평점</label>
                    <select
                      value={formData.highlightRating}
                      onChange={(e) => handleInputChange('highlightRating', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      {[1, 2, 3, 4, 5].map(rating => (
                        <option key={rating} value={rating}>
                          {'⭐'.repeat(rating)} ({rating}점)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">하이라이트 설명</label>
                  <textarea
                    value={formData.highlightDescription}
                    onChange={(e) => handleInputChange('highlightDescription', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* 기존 미디어 파일 관리 */}
        {galleryDetail && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              미디어 파일 ({galleryDetail.mediaFiles.length}개)
            </h3>
            
            {galleryDetail.mediaFiles.length > 0 ? (
              <div className="grid grid-cols-4 gap-4">
                {galleryDetail.mediaFiles.map((media) => (
                  <div key={media.id} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      {media.mediaType === 'IMAGE' ? (
                        <img
                          src={media.thumbnailUrl || media.fileUrl}
                          alt={media.fileName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-800">
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      )}
                      {media.isCover && (
                        <div className="absolute top-2 left-2">
                          <span className="bg-green-500 text-white px-2 py-1 text-xs rounded">
                            커버
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteMedia(media.id)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                    <p className="text-xs text-gray-500 mt-1 truncate">{media.originalFileName}</p>
                    <p className="text-xs text-gray-400">{media.fileSizeFormatted}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                미디어 파일이 없습니다.
              </div>
            )}
          </div>
        )}

        {/* 버튼 */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            disabled={isLoading}
          >
            취소
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center"
            disabled={isLoading}
          >
            {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
            {isLoading ? '수정 중...' : '수정 완료'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default GalleryEditModal;