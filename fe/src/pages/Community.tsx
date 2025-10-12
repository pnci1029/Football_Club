import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTeam } from '../contexts/TeamContext';
import { communityApi } from '../api/modules/community';
import { adminCommunityApi } from '../api/modules/adminCommunity';
import type { CommunityPost } from '../api/types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';

const Community: React.FC = () => {
  const { currentTeam } = useTeam();
  const location = useLocation();
  const { success, ToastContainer } = useToast();
  const { admin, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<{value: string, displayName: string}[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [actionType, setActionType] = useState<'hide' | 'delete'>('hide');

  const loadPosts = useCallback(async (page: number = 0, keyword?: string, category?: string) => {
    if (!currentTeam) {
      setError('팀 정보를 찾을 수 없습니다.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await communityApi.getPosts(parseInt(currentTeam.id), page, 20, keyword, category);
      setPosts(response.content);
      setTotalPages(response.totalPages);
      setCurrentPage(response.number);
    } catch (err) {
      setError('게시글을 불러오는데 실패했습니다.');
      setPosts([]); // 에러 시 빈 배열로 설정
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  }, [currentTeam]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await communityApi.getCategories();
        setCategories(categoriesData);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    if (currentTeam) {
      loadPosts(0, searchKeyword, selectedCategory);
    }
  }, [currentTeam, searchKeyword, selectedCategory, loadPosts]);

  // navigate state로 전달된 메시지를 Toast로 표시
  useEffect(() => {
    if (location.state?.message) {
      success(location.state.message);
      // state 정리하여 새로고침 시 중복 표시 방지
      window.history.replaceState({}, document.title);
    }
  }, [location.state, success]); // useCallback으로 메모이제이션된 success 함수

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchKeyword(searchInput.trim());
    setCurrentPage(0);
  };

  const handlePageChange = (page: number) => {
    loadPosts(page, searchKeyword, selectedCategory);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(0);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffDays === 1) {
      return '어제';
    } else if (diffDays < 7) {
      return `${diffDays}일전`;
    } else {
      return date.toLocaleDateString('ko-KR', {
        month: '2-digit',
        day: '2-digit'
      });
    }
  };

  const handleHidePost = (post: CommunityPost) => {
    setSelectedPost(post);
    setActionType('hide');
    setShowConfirmModal(true);
  };

  const handleDeletePost = (post: CommunityPost) => {
    setSelectedPost(post);
    setActionType('delete');
    setShowConfirmModal(true);
  };

  const confirmAction = async () => {
    if (!selectedPost) return;

    try {
      if (actionType === 'hide') {
        await adminCommunityApi.deactivatePost(selectedPost.id, '관리자에 의한 숨김 처리');
        success('게시글이 숨김 처리되었습니다.');
      } else {
        // 실제로는 deactivate를 사용 (완전 삭제가 아닌 비활성화)
        await adminCommunityApi.deactivatePost(selectedPost.id, '관리자에 의한 삭제 처리');
        success('게시글이 삭제되었습니다.');
      }
      
      // 게시글 목록 새로고침
      loadPosts(currentPage, searchKeyword, selectedCategory);
    } catch (error) {
      console.error('게시글 처리 실패:', error);
      success(`게시글 ${actionType === 'hide' ? '숨김' : '삭제'} 처리에 실패했습니다.`);
    } finally {
      setShowConfirmModal(false);
      setSelectedPost(null);
    }
  };

  if (loading && posts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">커뮤니티</h1>
              <p className="text-gray-600 mt-1">경기 문의, 교류 등 자유롭게 소통하세요</p>
            </div>
            <Link
              to="/community/write"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              글쓰기
            </Link>
          </div>


          {/* 카테고리 필터 및 검색 */}
          <div className="mt-4 space-y-4">
            {/* 카테고리 필터 */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryChange('')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === '' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                전체
              </button>
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => handleCategoryChange(category.displayName)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.displayName 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.displayName}
                </button>
              ))}
            </div>

            {/* 검색 */}
            <form onSubmit={handleSearch}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="제목, 내용으로 검색..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                검색
              </button>
            </div>
          </form>
          </div>
        </div>

        {/* 게시글 목록 */}
        {error ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => loadPosts(currentPage, searchKeyword, selectedCategory)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              다시 시도
            </button>
          </div>
        ) : (!posts || posts.length === 0) ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.477 8-10 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.477-8 10-8s10 3.582 10 8z" />
              </svg>
            </div>
            <p className="text-gray-600 text-lg">아직 게시글이 없습니다</p>
            <p className="text-gray-500 mt-2">첫 번째 글을 작성해보세요!</p>
            <Link
              to="/community/write"
              className="inline-flex items-center mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              글쓰기
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-200">
              {posts?.map((post) => (
                <Link
                  key={post.id}
                  to={`/community/${post.id}`}
                  className="block hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {post.isNotice && (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                              공지
                            </span>
                          )}
                          {post.category && (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                              {categories.find(cat => cat.value === post.category)?.displayName || post.category}
                            </span>
                          )}
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {post.title}
                          </h3>
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                          {post.content.replace(/\n/g, ' ').substring(0, 150)}
                          {post.content.length > 150 && '...'}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{post.authorName}</span>
                          <span>{formatDate(post.createdAt)}</span>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              <span>{post.viewCount}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.477 8-10 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.477-8 10-8s10 3.582 10 8z" />
                              </svg>
                              <span>{post.commentCount}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 관리자 기능 */}
                      {isAuthenticated && admin && (
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleHidePost(post);
                            }}
                            className="px-3 py-1.5 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-md transition-colors"
                          >
                            숨김
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeletePost(post);
                            }}
                            className="px-3 py-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                          >
                            삭제
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center py-6 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    이전
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const startPage = Math.max(0, currentPage - 2);
                    const pageNum = startPage + i;
                    if (pageNum >= totalPages) return null;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    다음
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 확인 모달 */}
      {showConfirmModal && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {actionType === 'hide' ? '게시글 숨김' : '게시글 삭제'}
            </h3>
            <p className="text-gray-600 mb-6">
              "{selectedPost.title}" 게시글을 {actionType === 'hide' ? '숨김 처리' : '삭제'}하시겠습니까?
              {actionType === 'hide' && (
                <span className="block text-sm text-gray-500 mt-2">
                  숨김 처리된 게시글은 일반 사용자에게 보이지 않습니다.
                </span>
              )}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                취소
              </button>
              <button
                onClick={confirmAction}
                className={`flex-1 px-4 py-2 text-white rounded-md transition-colors ${
                  actionType === 'hide' 
                    ? 'bg-orange-600 hover:bg-orange-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {actionType === 'hide' ? '숨김' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default Community;
