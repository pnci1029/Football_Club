import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeam } from '../contexts/TeamContext';
import GalleryGrid from '../components/gallery/GalleryGrid';
import GalleryFilters from '../components/gallery/GalleryFilters';
import LoadingSpinner from '../components/common/LoadingSpinner';
import GalleryEditModal from '../components/admin/GalleryEditModal';
import ConfirmDeleteModal from '../components/admin/ConfirmDeleteModal';
import { galleryService } from '../services/galleryAPI';
import { Gallery, GalleryCategory } from '../types/gallery';
import { TokenManager } from '../utils/tokenManager';

const GalleryPage: React.FC = () => {
  const { currentTeam, isLoading: teamLoading } = useTeam();
  const navigate = useNavigate();
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // 필터 상태
  const [selectedCategory, setSelectedCategory] = useState<GalleryCategory | ''>('');
  const [keyword, setKeyword] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // 관리자 상태
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingGallery, setEditingGallery] = useState<Gallery | null>(null);
  const [deletingGallery, setDeletingGallery] = useState<Gallery | null>(null);

  const loadGalleries = async (page: number = 0, reset: boolean = false) => {
    if (!currentTeam || isLoading) return;

    setIsLoading(true);
    try {
      const params = {
        page,
        size: 12,
        ...(selectedCategory && { category: selectedCategory }),
        ...(keyword && { keyword }),
        ...(selectedTags.length > 0 && { tags: selectedTags }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      };

      const response = await galleryService.getGalleries(params);

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

  // 로그인한 관리자만 갤러리 관리 가능
  useEffect(() => {
    const checkAdminStatus = () => {
      const isLoggedIn = TokenManager.isLoggedIn();
      setIsAdmin(isLoggedIn);
    };

    checkAdminStatus();

    // storage 이벤트 리스너로 로그인/로그아웃 감지
    window.addEventListener('storage', checkAdminStatus);

    return () => {
      window.removeEventListener('storage', checkAdminStatus);
    };
  }, []);

  // 팀이 변경되거나 필터가 변경될 때 갤러리 리로드
  useEffect(() => {
    if (currentTeam) {
      setCurrentPage(0);
      loadGalleries(0, true);
    }

    // 관리자 상태도 다시 체크
    const isLoggedIn = TokenManager.isLoggedIn();
    setIsAdmin(isLoggedIn);
  }, [currentTeam, selectedCategory, keyword, selectedTags, startDate, endDate]);

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      loadGalleries(currentPage + 1, false);
    }
  };

  const handleFilterChange = (filters: {
    category: GalleryCategory | '';
    keyword: string;
    tags: string[];
    startDate: string;
    endDate: string;
  }) => {
    setSelectedCategory(filters.category);
    setKeyword(filters.keyword);
    setSelectedTags(filters.tags);
    setStartDate(filters.startDate);
    setEndDate(filters.endDate);
  };

  // 관리자 기능 핸들러
  const handleCreateGallery = () => {
    navigate('/gallery/create');
  };

  const handleEditGallery = (gallery: Gallery) => {
    setEditingGallery(gallery);
  };

  const handleDeleteGallery = (gallery: Gallery) => {
    setDeletingGallery(gallery);
  };


  const handleGalleryUpdated = () => {
    setEditingGallery(null);
    loadGalleries(0, true);
  };

  const handleGalleryDeleted = async () => {
    if (!deletingGallery) return;

    try {
      await galleryService.deleteGallery(deletingGallery.id);
      setDeletingGallery(null);
      loadGalleries(0, true);
    } catch (error) {
      console.error('갤러리 삭제 실패:', error);
    }
  };

  if (teamLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!currentTeam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">갤러리를 찾을 수 없습니다</h2>
          <p className="text-gray-600">팀 정보를 확인해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {currentTeam.name} 갤러리
            </h1>
            {isAdmin && (
              <button
                onClick={handleCreateGallery}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-md hover:shadow-lg"
              >
                + 갤러리 추가
              </button>
            )}
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            우리 팀의 소중한 순간들을 담은 사진과 영상을 확인해보세요
          </p>
        </div>

        {/* 필터 */}
        <div className="mb-8">
          <GalleryFilters
            selectedCategory={selectedCategory}
            keyword={keyword}
            selectedTags={selectedTags}
            startDate={startDate}
            endDate={endDate}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* 갤러리 그리드 */}
        <GalleryGrid
          galleries={galleries}
          isLoading={isLoading}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          isAdmin={isAdmin}
          onEdit={handleEditGallery}
          onDelete={handleDeleteGallery}
        />

        {/* 로딩 스피너 */}
        {isLoading && galleries.length === 0 && (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        )}

        {/* 빈 상태 */}
        {!isLoading && galleries.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">갤러리가 비어있습니다</h3>
            <p className="text-gray-600">아직 업로드된 사진이나 영상이 없습니다.</p>
          </div>
        )}
      </div>

      {/* 모달들 */}
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

export default GalleryPage;
