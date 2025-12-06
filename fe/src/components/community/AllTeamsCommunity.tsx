import React, { useState, useEffect } from 'react';
import { allNoticeApi } from '../../api/modules/allNotice';
import type { AllNoticePost, TeamInfo } from '../../api/types';

const AllTeamsCommunity: React.FC = () => {
  const [posts, setPosts] = useState<AllNoticePost[]>([]);
  const [teams, setTeams] = useState<TeamInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeamId, setSelectedTeamId] = useState<number | undefined>(undefined);
  const [keyword, setKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // 데이터 로드
  const loadPosts = async (page: number = 0, reset: boolean = false) => {
    try {
      setLoading(true);
      const response = await allNoticeApi.getAllNotices({
        page,
        size: 10,
        teamId: selectedTeamId,
        keyword: keyword.trim() || undefined
      });

      if (reset) {
        setPosts(response.content);
      } else {
        setPosts(prev => [...prev, ...response.content]);
      }

      setCurrentPage(page);
      setHasMore(!response.last);
    } catch (error) {
      console.error('Failed to load community posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // 팀 목록 로드
  const loadTeams = async () => {
    try {
      const teamsData = await allNoticeApi.getActiveTeams();
      setTeams(teamsData);
    } catch (error) {
      console.error('Failed to load teams:', error);
    }
  };

  // 초기 로드
  useEffect(() => {
    loadTeams();
    loadPosts(0, true);
  }, []);

  // 필터 변경 시
  useEffect(() => {
    loadPosts(0, true);
  }, [selectedTeamId, keyword]);

  // 더보기
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadPosts(currentPage + 1, false);
    }
  };

  // 키워드 검색 핸들러
  const handleKeywordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadPosts(0, true);
  };

  // 날짜 포맷
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    }
  };

  // 팀 사이트로 이동
  const handleVisitTeam = (teamSubdomain: string | null) => {
    const url = allNoticeApi.getTeamUrl(teamSubdomain);
    if (url !== '#') {
      window.open(url, '_blank');
    }
  };

  // 게시글 상세로 이동
  const handlePostClick = (post: AllNoticePost) => {
    const teamUrl = allNoticeApi.getTeamUrl(post.teamSubdomain);
    if (teamUrl !== '#') {
      window.open(`${teamUrl}/notices/${post.id}`, '_blank');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <div className="text-center mb-6 sm:mb-8">
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
          전체 팀 커뮤니티
        </h3>
        <p className="text-sm sm:text-base text-gray-600">
          모든 축구 동호회의 최신 소식을 한 곳에서 확인하세요
        </p>
      </div>

      {/* 필터 및 검색 */}
      <div className="mb-6 space-y-4">
        {/* 팀 필터 */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTeamId(undefined)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedTeamId === undefined
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            전체
          </button>
          {teams.map((team) => (
            <button
              key={team.id}
              onClick={() => setSelectedTeamId(team.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedTeamId === team.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {team.name}
            </button>
          ))}
        </div>

        {/* 검색 */}
        <form onSubmit={handleKeywordSubmit} className="flex gap-2">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="게시글 검색..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            검색
          </button>
        </form>
      </div>

      {/* 게시글 목록 */}
      <div className="space-y-4">
        {posts.length === 0 && !loading ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-3">📝</div>
            <p>게시글이 없습니다.</p>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handlePostClick(post)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVisitTeam(post.teamSubdomain);
                    }}
                    className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full hover:bg-blue-200 transition-colors flex-shrink-0"
                  >
                    {post.teamName}
                  </button>
                  {true && (
                    <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full flex-shrink-0">
                      공지
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                  {formatDate(post.createdAt)}
                </span>
              </div>

              <h4 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                {post.title}
              </h4>

              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {post.content.replace(/\n/g, ' ')}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>작성자: {post.authorName}</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {post.viewCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.477 8-10 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.477-8 10-8s10 3.582 10 8z" />
                    </svg>
                    {post.commentCount}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 더보기 버튼 */}
      {hasMore && (
        <div className="text-center mt-6">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '로딩 중...' : '더보기'}
          </button>
        </div>
      )}

      {/* 로딩 상태 */}
      {loading && posts.length === 0 && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500">게시글을 불러오는 중...</p>
        </div>
      )}
    </div>
  );
};

export default AllTeamsCommunity;