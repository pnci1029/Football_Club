import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Notice } from '../types/interfaces/notice';
import { allNoticeService } from '../services/allNoticeService';

const GlobalNotices: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    loadGlobalNotices();
  }, [page, searchKeyword]);

  const loadGlobalNotices = async () => {
    try {
      setLoading(true);
      const response = await allNoticeService.getGlobalNotices(page, 10, searchKeyword || undefined);
      setNotices(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('전체 공지사항 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchKeyword(keyword);
    setPage(0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && notices.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="border-b border-gray-100 pb-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* 헤더 */}
          <div className="border-b border-gray-200 px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">전체 공지사항</h1>
            <p className="text-sm text-gray-600 mt-1">모든 팀의 전체 공개 공지사항을 확인하세요</p>
          </div>

          {/* 검색 */}
          <div className="border-b border-gray-200 px-6 py-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="공지사항 검색..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                검색
              </button>
            </form>
          </div>

          {/* 공지사항 목록 */}
          <div className="divide-y divide-gray-200">
            {notices.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">공지사항이 없습니다</h3>
                <p className="text-gray-600">
                  {searchKeyword ? '검색 결과가 없습니다.' : '전체 공개된 공지사항이 없습니다.'}
                </p>
              </div>
            ) : (
              notices.map((notice) => (
                <Link
                  key={notice.id}
                  to={`/global-notices/${notice.id}`}
                  state={{ notice }}
                  className="block px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 truncate mb-1">
                        {notice.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 space-x-4">
                        <span className="font-medium">{notice.teamName}</span>
                        <span>{notice.authorName}</span>
                        <span>{formatDate(notice.createdAt)} {formatTime(notice.createdAt)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-2 space-x-4">
                        <span>조회 {notice.viewCount}</span>
                        <span>댓글 {notice.commentCount}</span>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="border-t border-gray-200 px-6 py-4">
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  이전
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(0, Math.min(totalPages - 5, page - 2)) + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-2 text-sm border rounded-md ${
                        page === pageNum
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page === totalPages - 1}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  다음
                </button>
              </div>
            </div>
          )}
        </div>
    </div>
  );
};

export default GlobalNotices;