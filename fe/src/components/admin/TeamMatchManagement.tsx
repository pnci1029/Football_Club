import React, {useEffect, useState, useCallback} from 'react';
import {Button, Card, LoadingSpinner} from '../common';
import MatchCreateModal from './MatchCreateModal';
import { adminMatchService, AdminMatch } from '../../services/adminMatchService';
import { useToast } from '../Toast';

interface TeamMatchManagementProps {
  teamId: number;
}

const TeamMatchManagement: React.FC<TeamMatchManagementProps> = ({ teamId }) => {
  const { warning, ToastContainer } = useToast();
  const [matches, setMatches] = useState<AdminMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const handleMatchCreated = () => {
    fetchMatches();
  };

  const handleImportSchedule = () => {
    warning('경기 일정 가져오기 기능이 구현되지 않았습니다.');
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

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminMatchService.getMatchesByTeam(teamId, currentPage, 10);
      if (response.success && response.data) {
        setMatches(response.data.content);
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.totalElements);
      } else {
        setMatches([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (error) {
      console.error('경기 목록 로딩 실패:', error);
      setMatches([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [teamId, currentPage]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches, statusFilter]);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">경기 관리</h2>
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

      <div className="space-y-4">
        {matches.length === 0 ? (
          <Card padding="lg">
            <div className="text-center text-gray-500">
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
                    <div className="text-sm text-gray-500 mt-2">{match.stadium.name}</div>
                  </div>
                </Card>

                <div className="absolute top-2 right-2 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {}}
                  >
                    수정
                  </Button>
                  {match.status === 'IN_PROGRESS' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {}}
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

      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-4">
          <div className="text-sm text-gray-600">
            총 {totalElements}개 경기 중 {currentPage * 10 + 1}-{Math.min((currentPage + 1) * 10, totalElements)}개 표시 
            ({totalPages}페이지 중 {currentPage + 1}페이지)
          </div>
          
          <div className="flex gap-1">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handlePageChange(0)}
              disabled={currentPage === 0}
              className="px-3"
            >
              ««
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="px-3"
            >
              ‹
            </Button>
            
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
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="px-3"
            >
              ›
            </Button>
            
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

      <MatchCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onMatchCreated={handleMatchCreated}
      />

      <ToastContainer />
    </div>
  );
};

export default TeamMatchManagement;
