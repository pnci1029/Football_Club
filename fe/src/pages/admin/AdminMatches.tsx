import React, {useEffect, useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {Button, Card, LoadingSpinner} from '../../components/common';
import {MatchCard} from '../../components/match';

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
  }, [teamId, teams, statusFilter]);

  const fetchTeams = async () => {
    try {
      // TODO: 실제 API 호출로 교체
      const mockTeams: Team[] = [
        { id: 1, name: 'FC Barcelona', code: 'barcelona' },
        { id: 2, name: 'Real Madrid', code: 'realmadrid' },
        { id: 3, name: 'Manchester United', code: 'manchester' },
      ];
      setTeams(mockTeams);
    } catch (error) {
      console.error('팀 목록 로딩 실패:', error);
    }
  };

  const fetchMatches = async () => {
    setLoading(true);
    try {
      // TODO: 실제 API 호출로 교체
      const mockMatches: Match[] = [
        {
          id: 1,
          homeTeam: { id: 1, name: 'FC Barcelona', code: 'barcelona' },
          awayTeam: { id: 2, name: 'Real Madrid', code: 'realmadrid' },
          stadium: { id: 1, name: 'Camp Nou' },
          matchDate: '2024-01-15T19:00:00',
          homeTeamScore: 2,
          awayTeamScore: 1,
          status: 'COMPLETED'
        },
        {
          id: 2,
          homeTeam: { id: 3, name: 'Manchester United', code: 'manchester' },
          awayTeam: { id: 1, name: 'FC Barcelona', code: 'barcelona' },
          stadium: { id: 2, name: 'Old Trafford' },
          matchDate: '2024-01-22T20:00:00',
          homeTeamScore: null,
          awayTeamScore: null,
          status: 'SCHEDULED'
        }
      ];

      let filteredMatches = mockMatches;

      // 팀별 필터링
      if (teamId) {
        filteredMatches = mockMatches.filter(match =>
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

      setMatches(filteredMatches);
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

  const transformMatchForCard = (match: Match) => ({
    id: match.id,
    homeTeam: match.homeTeam.name,
    awayTeam: match.awayTeam.name,
    homeScore: match.homeTeamScore ?? undefined,
    awayScore: match.awayTeamScore ?? undefined,
    date: match.matchDate.split('T')[0],
    time: formatDateTime(match.matchDate).time,
    venue: match.stadium.name,
    status: match.status.toLowerCase() as 'scheduled' | 'live' | 'finished' | 'cancelled',
    matchType: 'league' as const,
    league: '관리자 리그'
  });

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
            <Button variant="primary">
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
            onChange={(e) => setStatusFilter(e.target.value)}
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
                <MatchCard
                  match={transformMatchForCard(match)}
                  ourTeamName={selectedTeam?.name}
                  compact
                />

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
      {matches.length > 0 && (
        <div className="flex justify-center">
          <div className="flex gap-2">
            <Button variant="outline" size="sm">이전</Button>
            <Button variant="primary" size="sm">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <Button variant="outline" size="sm">다음</Button>
          </div>
        </div>
      )}

      {/* TODO: 경기 생성 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">새 경기 생성</h3>
            <p className="text-gray-600 mb-4">경기 생성 모달은 추후 구현 예정입니다.</p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                취소
              </Button>
              <Button variant="primary">생성</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminMatches;
