import React, { useState } from 'react';
import { galleryService } from '../../services/galleryAPI';
import { GalleryCategory, PlayType, CreateGalleryRequest } from '../../types/gallery';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';

interface GalleryCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const GalleryCreateModal: React.FC<GalleryCreateModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: GalleryCategory.MATCH,
    tags: '',
    // 하이라이트 메타데이터
    isHighlight: false,
    playType: PlayType.GOAL,
    playerNames: '',
    gameMinute: '',
    highlightRating: 3,
    highlightDescription: ''
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB로 제한
    const MAX_TOTAL_SIZE = 200 * 1024 * 1024; // 총 200MB로 제한
    
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];
    
    files.forEach(file => {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        invalidFiles.push(`${file.name}: 이미지 또는 비디오 파일이 아닙니다`);
        return;
      }
      
      if (file.size > MAX_FILE_SIZE) {
        invalidFiles.push(`${file.name}: 파일 크기가 50MB를 초과합니다 (${(file.size / (1024 * 1024)).toFixed(1)}MB)`);
        return;
      }
      
      validFiles.push(file);
    });

    // 총 파일 크기 검증
    const currentTotalSize = selectedFiles.reduce((total, file) => total + file.size, 0);
    const newTotalSize = validFiles.reduce((total, file) => total + file.size, 0);
    
    if (currentTotalSize + newTotalSize > MAX_TOTAL_SIZE) {
      window.alert('전체 파일 크기가 200MB를 초과할 수 없습니다.');
      return;
    }

    if (invalidFiles.length > 0) {
      window.alert(`다음 파일들은 업로드할 수 없습니다:\n${invalidFiles.join('\n')}`);
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);

      // 미리보기 생성
      const previews: string[] = [];
      validFiles.forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            previews.push(e.target?.result as string);
            if (previews.length === validFiles.filter(f => f.type.startsWith('image/')).length) {
              setFilePreviews(prev => [...prev, ...previews]);
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = filePreviews.filter((_, i) => i !== index);
    
    setSelectedFiles(newFiles);
    setFilePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      window.alert('제목을 입력해주세요.');
      return;
    }

    if (selectedFiles.length === 0) {
      window.alert('최소 하나의 파일을 선택해주세요.');
      return;
    }

    // 파일 크기 재검증
    const MAX_FILE_SIZE = 50 * 1024 * 1024;
    const invalidFiles = selectedFiles.filter(file => file.size > MAX_FILE_SIZE);
    if (invalidFiles.length > 0) {
      window.alert(`다음 파일들의 크기가 50MB를 초과합니다:\n${invalidFiles.map(f => `${f.name} (${(f.size / (1024 * 1024)).toFixed(1)}MB)`).join('\n')}`);
      return;
    }

    setIsLoading(true);
    let createdGalleryId: number | null = null;
    
    try {
      // 갤러리 생성
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const createRequest: CreateGalleryRequest = {
        title: formData.title,
        description: formData.description || undefined,
        category: formData.category,
        tags: tags.length > 0 ? tags : undefined,
        highlightMetadata: formData.isHighlight && formData.category === GalleryCategory.HIGHLIGHT ? {
          playType: formData.playType,
          playerNames: formData.playerNames || undefined,
          gameMinute: formData.gameMinute ? parseInt(formData.gameMinute) : undefined,
          highlightRating: formData.highlightRating,
          description: formData.highlightDescription || undefined
        } : undefined
      };

      const createdGallery = await galleryService.createGallery(createRequest);
      createdGalleryId = createdGallery.id;

      // 파일 업로드 (실패 시 갤러리 삭제)
      try {
        await galleryService.uploadMediaFiles(createdGallery.id, selectedFiles);
      } catch (uploadError) {
        console.error('파일 업로드 실패:', uploadError);
        
        // 갤러리 삭제
        try {
          await galleryService.deleteGallery(createdGallery.id);
        } catch (deleteError) {
          console.error('갤러리 삭제 실패:', deleteError);
        }
        
        throw new Error('파일 업로드에 실패했습니다. 파일 크기를 확인해주세요.');
      }

      onSuccess();
    } catch (error) {
      console.error('갤러리 생성 실패:', error);
      
      if (error instanceof Error) {
        window.alert(error.message);
      } else {
        window.alert('갤러리 생성에 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: GalleryCategory.MATCH,
      tags: '',
      isHighlight: false,
      playType: PlayType.GOAL,
      playerNames: '',
      gameMinute: '',
      highlightRating: 3,
      highlightDescription: ''
    });
    setSelectedFiles([]);
    setFilePreviews([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="새 갤러리 만들기" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">새 갤러리 만들기</h2>
          <p className="text-gray-600">팀의 사진과 영상을 업로드하세요</p>
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
              placeholder="갤러리 제목을 입력하세요"
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
              placeholder="갤러리 설명을 입력하세요"
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
              <p className="text-xs text-gray-500 mt-1">예: 홈경기, 승리, 김철수</p>
            </div>
          </div>
        </div>

        {/* 하이라이트 메타데이터 */}
        {(formData.category === GalleryCategory.HIGHLIGHT || formData.isHighlight) && (
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
                하이라이트 정보 추가
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
                      placeholder="예: 25"
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
                    placeholder="하이라이트에 대한 상세 설명"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* 파일 업로드 */}
        <div className="border-t pt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            미디어 파일 <span className="text-red-500">*</span>
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="mt-4">
                  <p className="text-lg font-medium text-gray-900">파일을 선택하거나 드래그해서 업로드</p>
                  <p className="text-gray-600">이미지 및 동영상 파일 지원</p>
                  <p className="text-xs text-gray-500 mt-1">개별 파일 최대 50MB, 전체 최대 200MB</p>
                </div>
              </div>
            </label>
          </div>

          {/* 선택된 파일 미리보기 */}
          {selectedFiles.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                선택된 파일 ({selectedFiles.length}개)
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      {file.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                    <p className="text-xs text-gray-500 mt-1 truncate">{file.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 버튼 */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <button
            type="button"
            onClick={handleClose}
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
            {isLoading ? '생성 중...' : '갤러리 생성'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default GalleryCreateModal;