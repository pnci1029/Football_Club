import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { galleryService } from '../services/galleryAPI';
import { GalleryCategory } from '../types/gallery';
import { useTeam } from '../contexts/TeamContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const GalleryCreate: React.FC = () => {
  const navigate = useNavigate();
  const { currentTeam } = useTeam();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '' as GalleryCategory | '',
    tags: '',
    isFeatured: false
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    { value: 'MATCH' as GalleryCategory, label: '경기' },
    { value: 'TRAINING' as GalleryCategory, label: '훈련' },
    { value: 'EVENT' as GalleryCategory, label: '이벤트' },
    { value: 'HIGHLIGHT' as GalleryCategory, label: '하이라이트' },
    { value: 'OTHER' as GalleryCategory, label: '기타' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB로 제한
    const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 총 50MB로 제한
    
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];
    
    newFiles.forEach(file => {
      if (!file.type.startsWith('image/')) {
        invalidFiles.push(`${file.name}: 이미지 파일이 아닙니다`);
        return;
      }
      
      if (file.size > MAX_FILE_SIZE) {
        invalidFiles.push(`${file.name}: 파일 크기가 10MB를 초과합니다 (${(file.size / (1024 * 1024)).toFixed(1)}MB)`);
        return;
      }
      
      validFiles.push(file);
    });

    // 총 파일 크기 검증
    const currentTotalSize = selectedFiles.reduce((total, file) => total + file.size, 0);
    const newTotalSize = validFiles.reduce((total, file) => total + file.size, 0);
    
    if (currentTotalSize + newTotalSize > MAX_TOTAL_SIZE) {
      alert('전체 파일 크기가 50MB를 초과할 수 없습니다.');
      return;
    }

    if (invalidFiles.length > 0) {
      alert(`다음 파일들은 업로드할 수 없습니다:\n${invalidFiles.join('\n')}`);
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);

      // 미리보기 URL 생성
      const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);
    
    // 이전 URL 해제
    URL.revokeObjectURL(previewUrls[index]);
    
    setSelectedFiles(newFiles);
    setPreviewUrls(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentTeam) {
      alert('팀 정보를 찾을 수 없습니다.');
      return;
    }

    if (!formData.title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    if (!formData.category) {
      alert('카테고리를 선택해주세요.');
      return;
    }

    if (selectedFiles.length === 0) {
      alert('최소 1개의 이미지를 업로드해주세요.');
      return;
    }

    // 파일 크기 재검증
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    const invalidFiles = selectedFiles.filter(file => file.size > MAX_FILE_SIZE);
    if (invalidFiles.length > 0) {
      alert(`다음 파일들의 크기가 10MB를 초과합니다:\n${invalidFiles.map(f => `${f.name} (${(f.size / (1024 * 1024)).toFixed(1)}MB)`).join('\n')}`);
      return;
    }

    let createdGalleryId: number | null = null;

    try {
      setIsLoading(true);

      const createData = {
        teamId: currentTeam.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        isFeatured: formData.isFeatured,
        createdBy: 'USER' // TODO: 실제 사용자 정보로 변경
      };

      // 갤러리 생성
      const gallery = await galleryService.createGallery(createData);
      createdGalleryId = gallery.id;

      // 파일 업로드 (실패 시 갤러리 삭제)
      if (selectedFiles.length > 0) {
        try {
          await galleryService.uploadMediaFiles(gallery.id, selectedFiles);
        } catch (uploadError) {
          console.error('파일 업로드 실패:', uploadError);
          
          // 갤러리 삭제
          try {
            await galleryService.deleteGallery(gallery.id);
          } catch (deleteError) {
            console.error('갤러리 삭제 실패:', deleteError);
          }
          
          throw new Error('파일 업로드에 실패했습니다. 파일 크기를 확인해주세요.');
        }
      }

      alert('갤러리가 성공적으로 등록되었습니다.');
      navigate('/gallery');
    } catch (error) {
      console.error('갤러리 생성 실패:', error);
      
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('갤러리 등록에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigate('/gallery')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                목록으로 돌아가기
              </button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">갤러리 등록</h1>
            <p className="text-gray-600 mt-2">새로운 갤러리를 등록해보세요.</p>
          </div>

          {/* 등록 폼 */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="space-y-6">
              {/* 제목 */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  제목 *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="갤러리 제목을 입력해주세요"
                  required
                />
              </div>

              {/* 카테고리 */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  카테고리 *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">카테고리를 선택해주세요</option>
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 설명 */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  설명
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="갤러리에 대한 설명을 입력해주세요"
                />
              </div>

              {/* 태그 */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                  태그
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="태그를 쉼표(,)로 구분해서 입력해주세요"
                />
                <p className="text-sm text-gray-500 mt-1">
                  예: 경기, 승리, 골, 홈경기
                </p>
              </div>

              {/* 추천 설정 */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">추천 갤러리로 설정</span>
                </label>
              </div>

              {/* 파일 업로드 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이미지 업로드 *
                </label>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-sm text-gray-600">
                    클릭하여 이미지를 선택하거나 드래그하여 업로드하세요
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG, GIF 파일만 업로드 가능 (개별 파일 최대 10MB, 전체 최대 50MB)
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* 미리보기 */}
              {previewUrls.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">선택된 이미지 ({selectedFiles.length}개)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`미리보기 ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                        >
                          ×
                        </button>
                        <p className="text-xs text-gray-600 mt-1 truncate">
                          {selectedFiles[index].name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 버튼 */}
              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate('/gallery')}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  disabled={isLoading}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner />
                      <span className="ml-2">등록 중...</span>
                    </>
                  ) : (
                    '갤러리 등록'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GalleryCreate;