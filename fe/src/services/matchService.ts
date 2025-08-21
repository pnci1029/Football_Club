import { apiClient } from './api';
import { Match } from '../types/match';
import { ApiResponse, PageResponse } from '../types/api';

export class MatchService {
  async getMatches(page: number = 0, size: number = 10, status?: string): Promise<PageResponse<Match>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    });
    
    if (status) {
      params.append('status', status);
    }

    const response = await apiClient.get<ApiResponse<PageResponse<Match>>>(
      `/api/v1/matches?${params.toString()}`
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || '경기 목록을 불러오는데 실패했습니다');
    }
    
    return response.data;
  }

  async getMatch(id: number): Promise<Match> {
    const response = await apiClient.get<ApiResponse<Match>>(`/api/v1/matches/${id}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || '경기 정보를 불러오는데 실패했습니다');
    }
    
    return response.data;
  }

  async getMatchesByTeam(teamId: number, page: number = 0, size: number = 10, status?: string): Promise<PageResponse<Match>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    });
    
    if (status) {
      params.append('status', status);
    }

    const response = await apiClient.get<ApiResponse<PageResponse<Match>>>(
      `/api/v1/matches/team/${teamId}?${params.toString()}`
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || '팀 경기 목록을 불러오는데 실패했습니다');
    }
    
    return response.data;
  }

  async getUpcomingMatches(teamId: number): Promise<Match[]> {
    const response = await apiClient.get<ApiResponse<Match[]>>(`/api/v1/matches/team/${teamId}/upcoming`);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || '예정된 경기 목록을 불러오는데 실패했습니다');
    }
    
    return response.data;
  }
}

export const matchService = new MatchService();