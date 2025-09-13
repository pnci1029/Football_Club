/**
 * Matches API 모듈 - 경기 관련 모든 API 통합
 */

import { api } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import {
  Match,
  CreateMatchRequest,
  UpdateMatchRequest,
  ApiResponse,
  PageResponse,
  PageParams,
} from '../types';

// Public Matches API
export const matchesApi = {
  // 경기 목록 조회 (페이징, 상태 필터)
  getAll: (params?: PageParams & { status?: Match['status'] }): Promise<PageResponse<Match>> =>
    api.callEndpoint<PageResponse<Match>>(API_ENDPOINTS.MATCHES.LIST, undefined, undefined, params),

  // ID로 경기 조회
  getById: (id: number): Promise<Match> =>
    api.callEndpoint<Match>(API_ENDPOINTS.MATCHES.GET, { id }),

  // 팀별 경기 조회
  getByTeam: (teamId: number, params?: PageParams & { status?: Match['status'] }): Promise<PageResponse<Match>> =>
    api.callEndpoint<PageResponse<Match>>(
      API_ENDPOINTS.MATCHES.BY_TEAM, 
      { teamId }, 
      undefined, 
      params
    ),

  // 다가오는 경기들
  getUpcoming: (teamId: number): Promise<Match[]> =>
    api.callEndpoint<Match[]>(API_ENDPOINTS.MATCHES.UPCOMING, { teamId }),
};

// Admin Matches API
export const adminMatchesApi = {
  // 경기 목록 조회 (페이징, 상태 필터)
  getAll: (params?: PageParams & { status?: Match['status'] }): Promise<ApiResponse<PageResponse<Match>>> =>
    api.callEndpoint<ApiResponse<PageResponse<Match>>>(
      API_ENDPOINTS.ADMIN_MATCHES.LIST, 
      undefined, 
      undefined, 
      params
    ),

  // ID로 경기 조회
  getById: (id: number): Promise<ApiResponse<Match>> =>
    api.callEndpoint<ApiResponse<Match>>(API_ENDPOINTS.ADMIN_MATCHES.GET, { id }),

  // 팀별 경기 조회
  getByTeam: (teamId: number, params?: PageParams): Promise<ApiResponse<PageResponse<Match>>> =>
    api.callEndpoint<ApiResponse<PageResponse<Match>>>(
      API_ENDPOINTS.ADMIN_MATCHES.BY_TEAM, 
      { teamId }, 
      undefined, 
      params
    ),

  // 경기 생성
  create: (data: CreateMatchRequest): Promise<ApiResponse<Match>> =>
    api.callEndpoint<ApiResponse<Match>>(API_ENDPOINTS.ADMIN_MATCHES.CREATE, undefined, data),

  // 경기 수정
  update: (id: number, data: UpdateMatchRequest): Promise<ApiResponse<Match>> =>
    api.callEndpoint<ApiResponse<Match>>(API_ENDPOINTS.ADMIN_MATCHES.UPDATE, { id }, data),

  // 경기 삭제
  delete: (id: number): Promise<ApiResponse<string>> =>
    api.callEndpoint<ApiResponse<string>>(API_ENDPOINTS.ADMIN_MATCHES.DELETE, { id }),
};

// 통합 Matches API (Public + Admin)
export const Matches = {
  // Public API
  public: matchesApi,
  
  // Admin API
  admin: adminMatchesApi,
  
  // 편의 메서드들
  async getByStatus(status: Match['status'], teamId?: number): Promise<Match[]> {
    if (teamId) {
      const response = await matchesApi.getByTeam(teamId, { status });
      return response.content;
    } else {
      const response = await matchesApi.getAll({ status });
      return response.content;
    }
  },

  async getByDateRange(startDate: string, endDate: string, teamId?: number): Promise<Match[]> {
    let matches: Match[];
    
    if (teamId) {
      const response = await matchesApi.getByTeam(teamId);
      matches = response.content;
    } else {
      const response = await matchesApi.getAll();
      matches = response.content;
    }

    return matches.filter(match => 
      match.matchDate >= startDate && match.matchDate <= endDate
    );
  },

  async getRecentMatches(teamId?: number, limit: number = 10): Promise<Match[]> {
    let matches: Match[];
    
    if (teamId) {
      const response = await matchesApi.getByTeam(teamId);
      matches = response.content;
    } else {
      const response = await matchesApi.getAll();
      matches = response.content;
    }

    return matches
      .filter(match => match.status === 'COMPLETED')
      .sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime())
      .slice(0, limit);
  },

  // CRUD 헬퍼 (Admin)
  async createMatch(data: CreateMatchRequest): Promise<Match> {
    // 팀 간 경기 중복 체크 (같은 날짜)
    const existingMatches = await this.getByDateRange(
      data.matchDate.split('T')[0], 
      data.matchDate.split('T')[0]
    );
    
    const hasConflict = existingMatches.some(match => 
      (match.homeTeamId === data.homeTeamId || match.awayTeamId === data.homeTeamId ||
       match.homeTeamId === data.awayTeamId || match.awayTeamId === data.awayTeamId) &&
      Math.abs(new Date(match.matchDate).getTime() - new Date(data.matchDate).getTime()) < 3 * 60 * 60 * 1000 // 3시간 이내
    );

    if (hasConflict) {
      throw new Error('해당 시간대에 이미 경기가 예정되어 있습니다.');
    }

    const response = await adminMatchesApi.create(data);
    return response.data;
  },

  async updateMatch(id: number, data: UpdateMatchRequest): Promise<Match> {
    const response = await adminMatchesApi.update(id, data);
    return response.data;
  },

  async deleteMatch(id: number): Promise<void> {
    await adminMatchesApi.delete(id);
  },

  async updateScore(id: number, homeScore: number, awayScore: number): Promise<Match> {
    return this.updateMatch(id, {
      homeScore,
      awayScore,
      status: 'COMPLETED',
    });
  },

  async startMatch(id: number): Promise<Match> {
    return this.updateMatch(id, { status: 'IN_PROGRESS' });
  },

  async cancelMatch(id: number): Promise<Match> {
    return this.updateMatch(id, { status: 'CANCELLED' });
  },

  // 통계 메서드들
  async getMatchStats(teamId?: number): Promise<{
    total: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
    byStatus: Record<Match['status'], number>;
  }> {
    let matches: Match[];
    
    if (teamId) {
      const response = await matchesApi.getByTeam(teamId);
      matches = response.content;
    } else {
      const response = await matchesApi.getAll();
      matches = response.content;
    }

    const completedMatches = matches.filter(m => m.status === 'COMPLETED');
    
    let wins = 0, draws = 0, losses = 0, goalsFor = 0, goalsAgainst = 0;
    
    if (teamId) {
      completedMatches.forEach(match => {
        const isHome = match.homeTeamId === teamId;
        const teamScore = isHome ? (match.homeScore || 0) : (match.awayScore || 0);
        const opponentScore = isHome ? (match.awayScore || 0) : (match.homeScore || 0);
        
        goalsFor += teamScore;
        goalsAgainst += opponentScore;
        
        if (teamScore > opponentScore) wins++;
        else if (teamScore === opponentScore) draws++;
        else losses++;
      });
    }

    const byStatus = matches.reduce((acc, match) => {
      acc[match.status] = (acc[match.status] || 0) + 1;
      return acc;
    }, {} as Record<Match['status'], number>);

    return {
      total: matches.length,
      wins,
      draws, 
      losses,
      goalsFor,
      goalsAgainst,
      byStatus,
    };
  },
};

export default Matches;