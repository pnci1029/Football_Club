import { apiClient } from './api';

export interface AdminMatch {
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

export interface CreateMatchRequest {
  homeTeamId: number;
  awayTeamId: number;
  stadiumId: number;
  matchDate: string;
}

export interface UpdateMatchRequest {
  homeTeamId?: number;
  awayTeamId?: number;
  stadiumId?: number;
  matchDate?: string;
  homeTeamScore?: number;
  awayTeamScore?: number;
  status?: string;
}

export interface MatchPageResponse {
  content: AdminMatch[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  errorCode?: string;
  message?: string;
}

export class AdminMatchService {
  async getAllMatches(page: number = 0, size: number = 10, status?: string): Promise<ApiResponse<MatchPageResponse>> {
    let url = `/api/v1/admin/matches?page=${page}&size=${size}`;
    if (status && status !== 'all') {
      url += `&status=${status}`;
    }
    return apiClient.get(url);
  }

  async getMatchesByTeam(teamId: number, page: number = 0, size: number = 10): Promise<ApiResponse<MatchPageResponse>> {
    return apiClient.get(`/api/v1/admin/matches/team/${teamId}?page=${page}&size=${size}`);
  }

  async createMatch(request: CreateMatchRequest): Promise<ApiResponse<AdminMatch>> {
    return apiClient.post(`/api/v1/admin/matches`, request);
  }

  async getMatch(id: number): Promise<ApiResponse<AdminMatch>> {
    return apiClient.get(`/api/v1/admin/matches/${id}`);
  }

  async updateMatch(id: number, request: UpdateMatchRequest): Promise<ApiResponse<AdminMatch>> {
    return apiClient.put(`/api/v1/admin/matches/${id}`, request);
  }

  async deleteMatch(id: number): Promise<ApiResponse<string>> {
    return apiClient.delete(`/api/v1/admin/matches/${id}`);
  }
}

export const adminMatchService = new AdminMatchService();