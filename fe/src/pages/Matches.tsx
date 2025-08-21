import React, { useState, useMemo } from 'react';
import { dummyMatches, Match, dummyMatchEvents } from '../data/matches';
import { Card, Button } from '../components/common';

const getStatusText = (status: Match['status']) => {
  switch (status) {
    case 'scheduled': return '예정';
    case 'live': return '진행중';
    case 'finished': return '종료';
    case 'cancelled': return '취소';
    default: return status;
  }
};

const getStatusColor = (status: Match['status']) => {
  switch (status) {
    case 'scheduled': return 'bg-blue-100 text-blue-800';
    case 'live': return 'bg-green-100 text-green-800';
    case 'finished': return 'bg-gray-100 text-gray-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getMatchTypeText = (type: Match['matchType']) => {
  switch (type) {
    case 'league': return '리그전';
    case 'cup': return '컵대회';
    case 'friendly': return '친선경기';
    default: return type;
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

const isOurTeam = (teamName: string) => teamName === 'Football Club';

const Matches: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'finished'>('all');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const filteredMatches = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    return dummyMatches.filter(match => {
      if (filter === 'upcoming') {
        return match.status === 'scheduled' || match.date >= today;
      }
      if (filter === 'finished') {
        return match.status === 'finished';
      }
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filter]);

  const matchEvents = useMemo(() => {
    if (!selectedMatch) return [];
    return dummyMatchEvents
      .filter(event => event.matchId === selectedMatch.id)
      .sort((a, b) => a.minute - b.minute);
  }, [selectedMatch]);

  const getMatchResult = (match: Match) => {
    if (match.status !== 'finished' || !match.score) return null;
    
    const isHome = isOurTeam(match.homeTeam);
    const ourScore = isHome ? match.score.home : match.score.away;
    const opponentScore = isHome ? match.score.away : match.score.home;
    
    if (ourScore > opponentScore) return 'win';
    if (ourScore < opponentScore) return 'loss';
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
                          {formatDate(match.date)} {match.time}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(match.status)}`}>
                          {getStatusText(match.status)}
                        </span>
                        <span className="px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
                          {getMatchTypeText(match.matchType)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-8">
                          <div className="text-center">
                            <div className={`text-lg font-bold ${isOurTeam(match.homeTeam) ? 'text-primary-600' : 'text-gray-900'}`}>
                              {match.homeTeam}
                            </div>
                            <div className="text-xs text-gray-500">HOME</div>
                          </div>

                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900 mb-1">
                              {match.status === 'finished' && match.score ? (
                                `${match.score.home} : ${match.score.away}`
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
                            <div className={`text-lg font-bold ${isOurTeam(match.awayTeam) ? 'text-primary-600' : 'text-gray-900'}`}>
                              {match.awayTeam}
                            </div>
                            <div className="text-xs text-gray-500">AWAY</div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm text-gray-600 mb-1">📍 {match.venue}</div>
                          {match.league && (
                            <div className="text-xs text-gray-500">{match.league}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}

            {filteredMatches.length === 0 && (
              <Card padding="lg">
                <div className="text-center text-gray-500">
                  <p>해당 조건의 경기가 없습니다.</p>
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
                <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
                  {getMatchTypeText(selectedMatch.matchType)}
                </span>
              </div>
              
              <div className="text-lg text-gray-600 mb-2">
                {formatDate(selectedMatch.date)} {selectedMatch.time}
              </div>
              <div className="text-sm text-gray-500 mb-6">📍 {selectedMatch.venue}</div>

              <div className="flex items-center justify-center gap-12 mb-6">
                <div className="text-center">
                  <div className={`text-2xl font-bold mb-2 ${isOurTeam(selectedMatch.homeTeam) ? 'text-primary-600' : 'text-gray-900'}`}>
                    {selectedMatch.homeTeam}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Home</div>
                </div>

                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {selectedMatch.status === 'finished' && selectedMatch.score ? (
                      `${selectedMatch.score.home} : ${selectedMatch.score.away}`
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
                  <div className={`text-2xl font-bold mb-2 ${isOurTeam(selectedMatch.awayTeam) ? 'text-primary-600' : 'text-gray-900'}`}>
                    {selectedMatch.awayTeam}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Away</div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">경기 정보</h3>
                <div className="space-y-3">
                  {selectedMatch.league && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">리그</span>
                      <span className="font-medium">{selectedMatch.league}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">시즌</span>
                    <span className="font-medium">{selectedMatch.season}</span>
                  </div>
                  {selectedMatch.weather && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">날씨</span>
                      <span className="font-medium">{selectedMatch.weather}</span>
                    </div>
                  )}
                  {selectedMatch.attendance && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">관중</span>
                      <span className="font-medium">{selectedMatch.attendance}명</span>
                    </div>
                  )}
                  {selectedMatch.referee && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">주심</span>
                      <span className="font-medium">{selectedMatch.referee}</span>
                    </div>
                  )}
                </div>
              </div>

              {matchEvents.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">주요 사건</h3>
                  <div className="space-y-3">
                    {matchEvents.map((event) => (
                      <div key={event.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium text-primary-600 min-w-[3rem]">
                          {event.minute}'
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{event.player}</span>
                            <span className="text-xs px-2 py-1 bg-white rounded">
                              {event.type === 'goal' ? '⚽' : 
                               event.type === 'yellow_card' ? '🟨' : 
                               event.type === 'red_card' ? '🟥' : '🔄'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600">{event.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {selectedMatch.status === 'scheduled' && (
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