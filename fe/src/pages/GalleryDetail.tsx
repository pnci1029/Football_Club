import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { galleryService } from '../services/galleryAPI';
import { GalleryDetailDto } from '../types/gallery';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useTeam } from '../contexts/TeamContext';

const GalleryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentTeam } = useTeam();
  const [gallery, setGallery] = useState<GalleryDetailDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const loadGallery = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const galleryData = await galleryService.getGallery(parseInt(id));
        setGallery(galleryData);
      } catch (error) {
        console.error('갤러리 로드 실패:', error);
        navigate('/gallery');
      } finally {
        setIsLoading(false);
      }
    };

    loadGallery();
  }, [id, navigate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePrevImage = () => {
    if (gallery?.mediaFiles) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? gallery.mediaFiles.length - 1 : prev - 1
      );
    }
  };

  const handleNextImage = () => {
    if (gallery?.mediaFiles) {
      setCurrentImageIndex((prev) => 
        prev === gallery.mediaFiles.length - 1 ? 0 : prev + 1
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!gallery) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">갤러리를 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-4">요청하신 갤러리가 존재하지 않거나 삭제되었습니다.</p>
          <button
            onClick={() => navigate('/gallery')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            갤러리 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
              {gallery.categoryDisplayName}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">{gallery.title}</h1>
          
          <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatDate(gallery.createdAt)}
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              조회 {gallery.viewCount}회
            </div>
            {gallery.mediaFiles.length > 0 && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                이미지 {gallery.mediaFiles.length}개
              </div>
            )}
          </div>

          {gallery.description && (
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">{gallery.description}</p>
            </div>
          )}

          {/* 태그 */}
          {gallery.tags && gallery.tags.length > 0 && (
            <div className="flex gap-2 mt-6">
              {gallery.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 이미지 갤러리 */}
        {gallery.mediaFiles.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="relative">
              {/* 메인 이미지 */}
              <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                <img
                  src={gallery.mediaFiles[currentImageIndex].fileUrl}
                  alt={gallery.mediaFiles[currentImageIndex].originalFileName}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* 이전/다음 버튼 */}
              {gallery.mediaFiles.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* 이미지 인덱스 표시 */}
              {gallery.mediaFiles.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {gallery.mediaFiles.length}
                </div>
              )}
            </div>

            {/* 썸네일 리스트 */}
            {gallery.mediaFiles.length > 1 && (
              <div className="p-4 bg-gray-50">
                <div className="flex gap-2 overflow-x-auto">
                  {gallery.mediaFiles.map((media, index) => (
                    <button
                      key={media.id}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex
                          ? 'border-blue-500 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={media.fileUrl}
                        alt={media.originalFileName}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryDetail;