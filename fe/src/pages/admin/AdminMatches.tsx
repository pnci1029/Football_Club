import React, {useEffect, useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {Button, Card, LoadingSpinner} from '../../components/common';
import MatchCreateModal from '../../components/admin/MatchCreateModal';

interface Match {
  id: number;
  homeTeam: {
    id: number;
    name: string;
    code: string;
  };
  awayTeam: {
    id: number;
    name: string;
    code: string;
  };
  stadium: {
    id: number;
    name: string;
  };
  matchDate: string;
  homeTeamScore: number | null;
  awayTeamScore: number | null;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

interface Team {
  id: number;
  name: string;
  code: string;
}

const AdminMatches: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const handleMatchCreated = () => {
    fetchMatches();
  };

  const handleImportSchedule = () => {
    alert('경기 일정 가져오기 기능이 구현되지 않았습니다.');
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const teamId = searchParams.get('teamId');

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    if (teamId) {
      const team = teams.find(t => t.id.toString() === teamId);
      setSelectedTeam(team || null);
    }
    fetchMatches();
  }, [teamId, teams, statusFilter, currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTeams = async () => {
    try {
      // TODO: Replace with real API call to get teams from backend
      const mockTeams: Team[] = [];
      setTeams(mockTeams);
    } catch (error) {
      console.error('팀 목록 로딩 실패:', error);
    }
  };

  const fetchMatches = async () => {
    setLoading(true);
    try {
      // TODO: Replace with real API call
      // 임시로 페이지네이션을 위한 더미 데이터 생성
      const allMatches: Match[] = Array.from({ length: 47 }, (_, index) => ({
        id: index + 1,
        homeTeam: {
          id: (index % 4) + 1,
          name: `팀 ${String.fromCharCode(65 + (index % 4))}`,
          code: `TEAM${String.fromCharCode(65 + (index % 4))}`
        },
        awayTeam: {
          id: ((index + 1) % 4) + 1,
          name: `팀 ${String.fromCharCode(65 + ((index + 1) % 4))}`,
          code: `TEAM${String.fromCharCode(65 + ((index + 1) % 4))}`
        },
        stadium: {
          id: (index % 3) + 1,
          name: `구장 ${(index % 3) + 1}`
        },
        matchDate: new Date(Date.now() + (index - 20) * 24 * 60 * 60 * 1000).toISOString(),
        homeTeamScore: index < 20 ? Math.floor(Math.random() * 4) : null,
        awayTeamScore: index < 20 ? Math.floor(Math.random() * 4) : null,
        status: index < 20 ? 'COMPLETED' : index < 25 ? 'IN_PROGRESS' : index < 30 ? 'CANCELLED' : 'SCHEDULED'
      }));

      let filteredMatches = allMatches;

      // 팀별 필터링
      if (teamId) {
        filteredMatches = allMatches.filter(match =>
          match.homeTeam.id.toString() === teamId ||
          match.awayTeam.id.toString() === teamId
        );
      }

      // 상태별 필터링
      if (statusFilter !== 'all') {
        filteredMatches = filteredMatches.filter(match =>
          match.status.toLowerCase() === statusFilter.toLowerCase()
        );
      }

      // 페이지네이션 적용
      const pageSize = 10;
      const startIndex = currentPage * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedMatches = filteredMatches.slice(startIndex, endIndex);

      setMatches(paginatedMatches);
      setTotalElements(filteredMatches.length);
      setTotalPages(Math.ceil(filteredMatches.length / pageSize));
    } catch (error) {
      console.error('경기 목록 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return '예정';
      case 'IN_PROGRESS': return '진행중';
      case 'COMPLETED': return '종료';
      case 'CANCELLED': return '취소';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('ko-KR'),
      time: date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  // const transformMatchForCard = (match: Match) => ({
  //   id: match.id,
  //   homeTeam: match.homeTeam.name,
  //   awayTeam: match.awayTeam.name,
  //   homeScore: match.homeTeamScore ?? undefined,
  //   awayScore: match.awayTeamScore ?? undefined,
  //   date: match.matchDate.split('T')[0],
  //   time: formatDateTime(match.matchDate).time,
  //   venue: match.stadium.name,
  //   status: match.status.toLowerCase() as 'scheduled' | 'live' | 'finished' | 'cancelled',
  //   matchType: 'league' as const,
  //   league: '관리자 리그'
  // });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">경기 관리</h1>
            <p className="text-gray-600 mt-2">
              {selectedTeam
                ? `${selectedTeam.name} 팀의 경기를 관리합니다`
                : '전체 경기를 관리합니다'
              }
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(true)}
            >
              경기 생성
            </Button>
            <Button 
              variant="primary"
              onClick={handleImportSchedule}
            >
              경기 일정 가져오기
            </Button>
          </div>
        </div>
      </div>

      {/* 필터 */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* 팀 필터 */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">팀:</label>
          <select
            value={teamId || ''}
            onChange={(e) => {
              const newTeamId = e.target.value;
              if (newTeamId) {
                setSearchParams({ teamId: newTeamId });
              } else {
                setSearchParams({});
              }
              setCurrentPage(0); // 팀 변경 시 첫 페이지로
            }}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">전체 팀</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        {/* 상태 필터 */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">상태:</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(0); // 필터 변경 시 첫 페이지로
            }}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">전체</option>
            <option value="scheduled">예정</option>
            <option value="in_progress">진행중</option>
            <option value="completed">종료</option>
            <option value="cancelled">취소</option>
          </select>
        </div>

        {/* 검색 */}
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="팀명 또는 경기장으로 검색..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card padding="md">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {matches.filter(m => m.status === 'SCHEDULED').length}
            </div>
            <div className="text-sm text-gray-600">예정된 경기</div>
          </div>
        </Card>
        <Card padding="md">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {matches.filter(m => m.status === 'IN_PROGRESS').length}
            </div>
            <div className="text-sm text-gray-600">진행중</div>
          </div>
        </Card>
        <Card padding="md">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {matches.filter(m => m.status === 'COMPLETED').length}
            </div>
            <div className="text-sm text-gray-600">완료</div>
          </div>
        </Card>
        <Card padding="md">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {matches.filter(m => m.status === 'CANCELLED').length}
            </div>
            <div className="text-sm text-gray-600">취소</div>
          </div>
        </Card>
      </div>

      {/* 경기 목록 */}
      <div className="space-y-4">
        {matches.length === 0 ? (
          <Card padding="lg">
            <div className="text-center text-gray-500">
              <p className="text-lg mb-2">📅</p>
              <p>조건에 맞는 경기가 없습니다.</p>
              <Button
                variant="primary"
                className="mt-4"
                onClick={() => setShowCreateModal(true)}
              >
                첫 경기 생성하기
              </Button>
            </div>
          </Card>
        ) : (
          <>
            {matches.map((match) => (
              <div key={match.id} className="relative">
                <Card>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-gray-500">
                        {formatDateTime(match.matchDate).date} {formatDateTime(match.matchDate).time}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(match.status)}`}>
                        {getStatusText(match.status)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-semibold">{match.homeTeam.name}</div>
                      <div className="text-lg font-bold">
                        {match.status === 'COMPLETED' && match.homeTeamScore !== null && match.awayTeamScore !== null 
                          ? `${match.homeTeamScore} : ${match.awayTeamScore}`
                          : 'VS'
                        }
                      </div>
                      <div className="text-lg font-semibold">{match.awayTeam.name}</div>
                    </div>
                    <div className="text-sm text-gray-500 mt-2">📍 {match.stadium.name}</div>
                  </div>
                </Card>

                {/* 관리 버튼 */}
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // TODO: 경기 수정 모달
                      console.log('경기 수정:', match.id);
                    }}
                  >
                    수정
                  </Button>
                  {match.status === 'IN_PROGRESS' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        // TODO: 스코어 업데이트 모달
                        console.log('스코어 업데이트:', match.id);
                      }}
                    >
                      스코어
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-4">
          {/* 페이지 정보 */}
          <div className="text-sm text-gray-600">
            총 {totalElements}개 경기 중 {currentPage * 10 + 1}-{Math.min((currentPage + 1) * 10, totalElements)}개 표시 
            ({totalPages}페이지 중 {currentPage + 1}페이지)
          </div>
          
          {/* 페이지네이션 버튼 */}
          <div className="flex gap-1">
            {/* 첫 페이지 */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handlePageChange(0)}
              disabled={currentPage === 0}
              className="px-3"
            >
              ««
            </Button>
            
            {/* 이전 페이지 */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="px-3"
            >
              ‹
            </Button>
            
            {/* 페이지 번호들 */}
            {getPageNumbers().map(pageNum => (
              <Button 
                key={pageNum}
                variant={currentPage === pageNum ? "primary" : "outline"}
                size="sm"
                onClick={() => handlePageChange(pageNum)}
                className="px-3"
              >
                {pageNum + 1}
              </Button>
            ))}
            
            {/* 다음 페이지 */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="px-3"
            >
              ›
            </Button>
            
            {/* 마지막 페이지 */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handlePageChange(totalPages - 1)}
              disabled={currentPage >= totalPages - 1}
              className="px-3"
            >
              »»
            </Button>
          </div>
        </div>
      )}

      {/* 경기 생성 모달 */}
      <MatchCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onMatchCreated={handleMatchCreated}
      />
    </div>
  );
};

export default AdminMatches;
