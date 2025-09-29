import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Notice {
  id: number;
  title: string;
  content: string;
  authorName: string;
  viewCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  teamId: number;
  teamName: string;
}

interface Team {
  id: number;
  name: string;
  code: string;
}

const AdminNotices: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [keyword, setKeyword] = useState('');

  // 팀 목록 로드
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch('/v1/admin/teams');
        const data = await response.json();
        if (data.success) {
          setTeams(data.data);
          if (data.data.length > 0) {
            setSelectedTeam(data.data[0].id);
          }
        }
      } catch (error) {
        console.error('팀 목록 로딩 실패:', error);
      }
    };

    fetchTeams();
  }, []);

  // 공지사항 목록 로드
  useEffect(() => {
    if (!selectedTeam) return;

    const fetchNotices = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          teamId: selectedTeam.toString(),
          page: currentPage.toString(),
          size: '10',
        });
        
        if (keyword) {
          params.append('keyword', keyword);
        }

        const response = await fetch(`/v1/notices?${params}`);
        const data = await response.json();
        
        if (data.success) {
          setNotices(data.data.content);
          setTotalPages(data.data.totalPages);
        }
      } catch (error) {
        console.error('공지사항 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, [selectedTeam, currentPage, keyword]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  if (loading && notices.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">공지사항 관리</h1>
            <p className="text-gray-600 mt-2">각 팀별 공지사항을 관리할 수 있습니다</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              to="/admin/notices/create"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              📝 공지사항 작성
            </Link>
          </div>
        </div>
      </div>

      {/* 필터 및 검색 */}
      <div className="bg-white p-4 border border-gray-200 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* 팀 선택 */}
          <div>
            <label htmlFor="team-select" className="block text-sm font-medium text-gray-700 mb-1">
              팀 선택
            </label>
            <select
              id="team-select"
              value={selectedTeam || ''}
              onChange={(e) => setSelectedTeam(Number(e.target.value))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">팀을 선택하세요</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name} ({team.code})
                </option>
              ))}
            </select>
          </div>

          {/* 검색 */}
          <div>
            <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-1">
              검색
            </label>
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                id="keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="제목, 내용으로 검색"
                className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-700 hover:bg-gray-100"
              >
                🔍
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 공지사항 목록 */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            공지사항 목록
            {selectedTeam && (
              <span className="text-sm text-gray-500 ml-2">
                ({teams.find(t => t.id === selectedTeam)?.name})
              </span>
            )}
          </h2>
        </div>

        {notices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    제목
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작성자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    조회수
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    댓글
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작성일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {notices.map((notice) => (
                  <tr key={notice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900 truncate max-w-xs">
                          {notice.title}
                        </div>
                        <div className="text-gray-500 truncate max-w-xs">
                          {notice.content.substring(0, 50)}...
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {notice.authorName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {notice.viewCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {notice.commentCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(notice.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link
                        to={`/admin/notices/${notice.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        보기
                      </Link>
                      <Link
                        to={`/admin/notices/${notice.id}/edit`}
                        className="text-green-600 hover:text-green-900"
                      >
                        수정
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-2">📝</div>
            <p className="text-gray-500">
              {selectedTeam ? '공지사항이 없습니다.' : '팀을 선택해주세요.'}
            </p>
            {selectedTeam && (
              <Link
                to="/admin/notices/create"
                className="inline-flex items-center mt-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                첫 번째 공지사항 작성하기
              </Link>
            )}
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>
              <span className="text-sm text-gray-700">
                {currentPage + 1} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default AdminNotices;