import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { allNoticeApi } from '../api/modules/allNotice';
import type { AllNoticePost } from '../api/types';
import LoadingSpinner from '../components/common/LoadingSpinner';

const GlobalNoticeDetail: React.FC = () => {
  const { noticeId } = useParams<{ noticeId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [notice, setNotice] = useState<AllNoticePost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (noticeId) {
      loadNotice();
    }
  }, [noticeId]);

  const loadNotice = async () => {
    if (!noticeId) return;

    try {
      setLoading(true);
      
      // location.state에서 notice 데이터가 전달되었는지 확인
      if (location.state && location.state.notice) {
        setNotice(location.state.notice);
        setLoading(false);
        return;
      }

      // API 호출 대신 전체 공지사항 목록에서 찾기
      const response = await allNoticeApi.getGlobalNotices({ page: 0, size: 100 });
      const foundNotice = response.content.find(n => n.id === parseInt(noticeId));
      
      if (foundNotice) {
        setNotice(foundNotice);
      } else {
        console.error('Notice not found');
        navigate('/global-notices');
      }
    } catch (err) {
      console.error('Failed to load notice:', err);
      navigate('/global-notices');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleTeamSiteClick = () => {
    if (notice?.teamSubdomain) {
      const teamUrl = allNoticeApi.getTeamUrl(notice.teamSubdomain);
      window.open(teamUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">공지사항을 찾을 수 없습니다.</p>
          <Link
            to="/global-notices"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 뒤로가기 버튼 */}
        <div className="mb-6">
          <Link
            to="/global-notices"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            전체 공지사항 목록으로 돌아가기
          </Link>
        </div>

        {/* 공지사항 내용 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          {/* 헤더 */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                    공지
                  </span>
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                    {notice.teamName}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">{notice.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>작성자: {notice.authorName}</span>
                  <span>작성일: {formatDate(notice.createdAt)}</span>
                  <span>조회수: {notice.viewCount}</span>
                </div>
              </div>
              {notice.teamSubdomain && (
                <button
                  onClick={handleTeamSiteClick}
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 transition-colors border border-blue-600 rounded hover:bg-blue-50"
                >
                  팀 사이트 방문
                </button>
              )}
            </div>
          </div>

          {/* 본문 */}
          <div className="px-6 py-8">
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-900 leading-relaxed">
                {notice.content}
              </div>
            </div>
          </div>

          {/* 팀 정보 */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">이 공지사항은 {notice.teamName}에서 작성되었습니다</h3>
                <p className="text-sm text-gray-600">더 많은 정보를 원하시면 팀 사이트를 방문해보세요.</p>
              </div>
              {notice.teamSubdomain && (
                <button
                  onClick={handleTeamSiteClick}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  {notice.teamName} 사이트 방문
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalNoticeDetail;