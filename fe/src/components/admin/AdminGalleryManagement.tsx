import React, { useState, useEffect } from 'react';
import { galleryAPI } from '../../services/galleryAPI';
import { Gallery, GalleryCategory, GalleryStatistics } from '../../types/gallery';
import LoadingSpinner from '../common/LoadingSpinner';
import GalleryCreateModal from './GalleryCreateModal';
import GalleryEditModal from './GalleryEditModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';

const AdminGalleryManagement: React.FC = () => {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [statistics, setStatistics] = useState<GalleryStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  // 필터 상태
  const [selectedCategory, setSelectedCategory] = useState<GalleryCategory | ''>('');
  const [keyword, setKeyword] = useState('');

  // 모달 상태
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingGallery, setEditingGallery] = useState<Gallery | null>(null);
  const [deletingGallery, setDeletingGallery] = useState<Gallery | null>(null);

  const categories: { value: GalleryCategory | ''; label: string }[] = [
    { value: '', label: '전체 카테고리' },
    { value: GalleryCategory.MATCH, label: '경기' },
    { value: GalleryCategory.TRAINING, label: '훈련' },
    { value: GalleryCategory.EVENT, label: '이벤트' },
    { value: GalleryCategory.PLAYER, label: '선수' },
    { value: GalleryCategory.FACILITY, label: '시설' },
    { value: GalleryCategory.ACHIEVEMENT, label: '성취' },
    { value: GalleryCategory.HIGHLIGHT, label: '하이라이트' },
    { value: GalleryCategory.ETC, label: '기타' }
  ];

  useEffect(() => {
    loadGalleries(true);
    loadStatistics();
  }, [selectedCategory, keyword]);

  const loadGalleries = async (reset: boolean = false) => {
    setIsLoading(true);
    try {
      const page = reset ? 0 : currentPage;
      const params = {
        page,
        size: 20,
        ...(selectedCategory && { category: selectedCategory }),
        ...(keyword && { keyword })
      };

      const response = await galleryAPI.getGalleries(params);
      
      if (reset) {
        setGalleries(response.content);
      } else {
        setGalleries(prev => [...prev, ...response.content]);
      }
      
      setCurrentPage(response.number);
      setTotalPages(response.totalPages);
      setHasMore(!response.last);
    } catch (error) {
      console.error('갤러리 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const data = await galleryAPI.getGalleryStatistics();
      setStatistics(data);
    } catch (error) {
      console.error('통계 로드 실패:', error);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      loadGalleries(false);
    }
  };

  const handleCreateGallery = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditGallery = (gallery: Gallery) => {
    setEditingGallery(gallery);
  };

  const handleDeleteGallery = (gallery: Gallery) => {
    setDeletingGallery(gallery);
  };

  const handleGalleryCreated = () => {
    setIsCreateModalOpen(false);
    loadGalleries(true);
    loadStatistics();
  };

  const handleGalleryUpdated = () => {
    setEditingGallery(null);
    loadGalleries(true);
    loadStatistics();
  };

  const handleGalleryDeleted = async () => {
    if (!deletingGallery) return;
    
    try {
      await galleryAPI.deleteGallery(deletingGallery.id);
      setDeletingGallery(null);
      loadGalleries(true);
      loadStatistics();
    } catch (error) {
      console.error('갤러리 삭제 실패:', error);
    }
  };

  const toggleGalleryStatus = async (gallery: Gallery) => {
    try {
      await galleryAPI.toggleGalleryStatus(gallery.id);
      loadGalleries(true);
      loadStatistics();
    } catch (error) {
      console.error('갤러리 상태 변경 실패:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryBadgeClass = (category: GalleryCategory) => {
    const classes = {
      [GalleryCategory.MATCH]: 'bg-red-100 text-red-800',
      [GalleryCategory.TRAINING]: 'bg-blue-100 text-blue-800',
      [GalleryCategory.EVENT]: 'bg-green-100 text-green-800',
      [GalleryCategory.PLAYER]: 'bg-purple-100 text-purple-800',
      [GalleryCategory.FACILITY]: 'bg-yellow-100 text-yellow-800',
      [GalleryCategory.ACHIEVEMENT]: 'bg-orange-100 text-orange-800',
      [GalleryCategory.HIGHLIGHT]: 'bg-pink-100 text-pink-800',
      [GalleryCategory.ETC]: 'bg-gray-100 text-gray-800'
    };
    return classes[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">갤러리 관리</h1>
          <p className="text-gray-600">팀의 사진과 영상을 관리합니다</p>
        </div>
        <button
          onClick={handleCreateGallery}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          새 갤러리 추가
        </button>
      </div>

      {/* 통계 */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">전체 갤러리</div>
            <div className="text-2xl font-bold text-gray-900">{statistics.totalGalleryCount}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">총 조회수</div>
            <div className="text-2xl font-bold text-gray-900">{statistics.totalViewCount.toLocaleString()}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">미디어 파일 수</div>
            <div className="text-2xl font-bold text-gray-900">{statistics.totalMediaCount}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500">이번 달 추가</div>
            <div className="text-2xl font-bold text-gray-900">{statistics.thisMonthGalleryCount}</div>
          </div>
        </div>
      )}

      {/* 필터 */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="제목으로 검색..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as GalleryCategory | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 갤러리 목록 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  갤러리
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  카테고리
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  미디어
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  조회수
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  생성일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {galleries.map((gallery) => (
                <tr key={gallery.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        {gallery.coverImageUrl ? (
                          <img
                            className="h-12 w-12 rounded-lg object-cover"
                            src={gallery.coverImageUrl}
                            alt=""
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{gallery.title}</div>
                        <div className="text-sm text-gray-500 line-clamp-1">{gallery.description}</div>
                        {gallery.isFeatured && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            ⭐ 추천
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryBadgeClass(gallery.category)}`}>
                      {gallery.categoryDisplayName}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      <span>📷 {gallery.imageCount}</span>
                      <span>🎬 {gallery.videoCount}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {gallery.viewCount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(gallery.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditGallery(gallery)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDeleteGallery(gallery)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 더보기 버튼 */}
        {hasMore && galleries.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <button
              onClick={handleLoadMore}
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : '더보기'}
            </button>
          </div>
        )}

        {/* 빈 상태 */}
        {!isLoading && galleries.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">갤러리가 없습니다</h3>
            <p className="mt-1 text-sm text-gray-500">첫 번째 갤러리를 만들어보세요.</p>
            <div className="mt-6">
              <button
                onClick={handleCreateGallery}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                갤러리 추가
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 모달들 */}
      {isCreateModalOpen && (
        <GalleryCreateModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleGalleryCreated}
        />
      )}

      {editingGallery && (
        <GalleryEditModal
          gallery={editingGallery}
          isOpen={!!editingGallery}
          onClose={() => setEditingGallery(null)}
          onSuccess={handleGalleryUpdated}
        />
      )}

      {deletingGallery && (
        <ConfirmDeleteModal
          title="갤러리 삭제"
          itemName={deletingGallery.title}
          itemType="갤러리"
          isOpen={!!deletingGallery}
          onClose={() => setDeletingGallery(null)}
          onConfirm={handleGalleryDeleted}
        />
      )}
    </div>
  );
};

export default AdminGalleryManagement;
