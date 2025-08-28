import React, { useState, useMemo } from 'react';
import { MatchDto } from '../types/match';
import { useMatches } from '../hooks/useMatches';
import { Card, Button, LoadingSpinner } from '../components/common';

const getStatusText = (status: MatchDto['status']) => {
  switch (status) {
    case 'SCHEDULED': return '예정';
    case 'IN_PROGRESS': return '진행중';
    case 'FINISHED': return '종료';
    case 'CANCELLED': return '취소';
    default: return status;
  }
};

const getStatusColor = (status: MatchDto['status']) => {
  switch (status) {
    case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
    case 'IN_PROGRESS': return 'bg-green-100 text-green-800';
    case 'FINISHED': return 'bg-gray-100 text-gray-800';
    case 'CANCELLED': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};


const formatDate = (date: string) => {
  const d = new Date(date);
  return d.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  });
};

const isOurTeam = (teamName: string) => {
  // Check if it's our current team by comparing with window location
  const hostname = window.location.hostname;
  const subdomain = hostname.split('.')[0];
  return teamName.toLowerCase().includes(subdomain) || teamName === 'Football Club';
};

const Matches: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'finished'>('all');
  const [selectedMatch, setSelectedMatch] = useState<MatchDto | null>(null);
  const { data: matchesPage, loading, error } = useMatches(0, 50);
  
  const matches = matchesPage?.content || [];

  const filteredMatches = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    return matches.filter(match => {
      if (filter === 'upcoming') {
        return match.status === 'SCHEDULED' || match.matchDate >= today;
      }
      if (filter === 'finished') {
        return match.status === 'FINISHED';
      }
      return true;
    }).sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime());
  }, [filter, matches]);

  const matchEvents = useMemo(() => {
    // For now, return empty array until match events API is implemented
    return [];
  }, [selectedMatch]);

  const getMatchResult = (match: MatchDto) => {
    if (match.status !== 'FINISHED' || (match.homeTeamScore === null || match.awayTeamScore === null)) return null;
    
    const isHome = isOurTeam(match.homeTeam.name);
    const ourScore = isHome ? match.homeTeamScore : match.awayTeamScore;
    const opponentScore = isHome ? match.awayTeamScore : match.homeTeamScore;
    
    if (ourScore! > opponentScore!) return 'win';
    if (ourScore! < opponentScore!) return 'loss';
    return 'draw';
  };

  const getResultColor = (result: string | null) => {
    switch (result) {
      case 'win': return 'text-green-600 bg-green-50';
      case 'loss': return 'text-red-600 bg-red-50';
      case 'draw': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getResultText = (result: string | null) => {
    switch (result) {
      case 'win': return '승';
      case 'loss': return '패';
      case 'draw': return '무';
      default: return '-';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">경기 일정</h1>
        <p className="text-gray-600">우리 팀의 경기 일정과 결과를 확인하세요</p>
      </div>

      {!selectedMatch ? (
        <>
          <div className="flex gap-2 mb-6">
            <Button
              variant={filter === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              전체
            </Button>
            <Button
              variant={filter === 'upcoming' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('upcoming')}
            >
              예정된 경기
            </Button>
            <Button
              variant={filter === 'finished' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('finished')}
            >
              경기 결과
            </Button>
          </div>

          <div className="space-y-4">
            {filteredMatches.map((match) => {
              const result = getMatchResult(match);
              return (
                <Card
                  key={match.id}
                  hover
                  padding="md"
                  onClick={() => setSelectedMatch(match)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="text-sm text-gray-500">
                          {formatDate(match.matchDate.split('T')[0])} {match.matchDate.split('T')[1]?.substring(0,5)}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(match.status)}`}>
                          {getStatusText(match.status)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-8">
                          <div className="text-center">
                            <div className={`text-lg font-bold ${isOurTeam(match.homeTeam.name) ? 'text-primary-600' : 'text-gray-900'}`}>
                              {match.homeTeam.name}
                            </div>
                            <div className="text-xs text-gray-500">HOME</div>
                          </div>

                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900 mb-1">
                              {match.status === 'FINISHED' && match.homeTeamScore !== null && match.awayTeamScore !== null ? (
                                `${match.homeTeamScore} : ${match.awayTeamScore}`
                              ) : (
                                'VS'
                              )}
                            </div>
                            {result && (
                              <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${getResultColor(result)}`}>
                                {getResultText(result)}
                              </div>
                            )}
                          </div>

                          <div className="text-center">
                            <div className={`text-lg font-bold ${isOurTeam(match.awayTeam.name) ? 'text-primary-600' : 'text-gray-900'}`}>
                              {match.awayTeam.name}
                            </div>
                            <div className="text-xs text-gray-500">AWAY</div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm text-gray-600 mb-1">📍 {match.stadium.name}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}

            {filteredMatches.length === 0 && (
              <Card padding="lg">
                <div className="text-center text-gray-500 py-12">
                  <div className="text-gray-400 text-6xl mb-4">⚽</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 경기가 없습니다</h3>
                  <p className="text-gray-600">
                    관리자 페이지에서 경기를 추가해주세요.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </>
      ) : (
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedMatch(null)}
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            }
            className="mb-6"
          >
            경기 목록으로 돌아가기
          </Button>

          <Card padding="lg">
            <div className="text-center mb-8">
              <div className="flex justify-center gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedMatch.status)}`}>
                  {getStatusText(selectedMatch.status)}
                </span>
              </div>
              
              <div className="text-lg text-gray-600 mb-2">
                {formatDate(selectedMatch.matchDate.split('T')[0])} {selectedMatch.matchDate.split('T')[1]?.substring(0,5)}
              </div>
              <div className="text-sm text-gray-500 mb-6">📍 {selectedMatch.stadium.name}</div>

              <div className="flex items-center justify-center gap-12 mb-6">
                <div className="text-center">
                  <div className={`text-2xl font-bold mb-2 ${isOurTeam(selectedMatch.homeTeam.name) ? 'text-primary-600' : 'text-gray-900'}`}>
                    {selectedMatch.homeTeam.name}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Home</div>
                </div>

                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {selectedMatch.status === 'FINISHED' && selectedMatch.homeTeamScore !== null && selectedMatch.awayTeamScore !== null ? (
                      `${selectedMatch.homeTeamScore} : ${selectedMatch.awayTeamScore}`
                    ) : (
                      'VS'
                    )}
                  </div>
                  {getMatchResult(selectedMatch) && (
                    <div className={`inline-block px-3 py-1 rounded-lg text-sm font-medium ${getResultColor(getMatchResult(selectedMatch))}`}>
                      우리팀 {getResultText(getMatchResult(selectedMatch))}
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <div className={`text-2xl font-bold mb-2 ${isOurTeam(selectedMatch.awayTeam.name) ? 'text-primary-600' : 'text-gray-900'}`}>
                    {selectedMatch.awayTeam.name}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Away</div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">경기 정보</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">경기장</span>
                    <span className="font-medium">{selectedMatch.stadium.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">홈팀</span>
                    <span className="font-medium">{selectedMatch.homeTeam.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">원정팀</span>
                    <span className="font-medium">{selectedMatch.awayTeam.name}</span>
                  </div>
                </div>
              </div>

            </div>

            {selectedMatch.status === 'SCHEDULED' && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex gap-3">
                  <Button variant="primary" className="flex-1">
                    경기 알림 설정
                  </Button>
                  <Button variant="outline">
                    캘린더에 추가
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default Matches;