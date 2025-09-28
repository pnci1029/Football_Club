import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTeam } from '../contexts/TeamContext';
import { noticeApi } from '../api/modules/notice';
import type { Notice } from '../api/types';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Notices: React.FC = () => {
  const { currentTeam } = useTeam();
  const [posts, setPosts] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const loadPosts = useCallback(async (page: number = 0, keyword?: string) => {
    if (!currentTeam) {
      setError('팀 정보를 찾을 수 없습니다.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // 공지사항만 가져오기
      const response = await noticeApi.getNotices(parseInt(currentTeam.id), page, 20, keyword);
      setPosts(response.content);
      setTotalPages(response.totalPages);
      setCurrentPage(response.number);
    } catch (err) {
      setError('공지사항을 불러오는데 실패했습니다.');
      setPosts([]);
      console.error('Failed to load notices:', err);
    } finally {
      setLoading(false);
    }
  }, [currentTeam]);

  useEffect(() => {
    if (currentTeam) {
      loadPosts(0, searchKeyword);
    }
  }, [currentTeam, searchKeyword, loadPosts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchKeyword(searchInput.trim());
    setCurrentPage(0);
  };

  const handlePageChange = (page: number) => {
    loadPosts(page, searchKeyword);
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
              <h1 className="text-2xl font-bold text-gray-900">공지사항</h1>
              <p className="text-gray-600 mt-1">팀 운영진이 작성한 공지사항을 확인하세요</p>
            </div>
          </div>

          {/* 검색 */}
          <form onSubmit={handleSearch} className="mt-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="공지사항 검색..."
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

        {/* 공지사항 목록 */}
        {error ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => loadPosts(currentPage, searchKeyword)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              다시 시도
            </button>
          </div>
        ) : (!posts || posts.length === 0) ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <p className="text-gray-600 text-lg">아직 공지사항이 없습니다</p>
            <p className="text-gray-500 mt-2">새로운 공지사항을 기다려주세요!</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-200">
              {posts?.map((post) => (
                <Link
                  key={post.id}
                  to={`/notices/${post.id}`}
                  className="block hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                            공지
                          </span>
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
    </div>
  );
};

export default Notices;