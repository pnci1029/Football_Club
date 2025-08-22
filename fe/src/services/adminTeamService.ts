import { apiClient } from './api';

export interface AdminTeam {
  id: number;
  code: string;
  name: string;
  description: string;
  logoUrl?: string;
  playerCount?: number;
  createdAt: string;
}

export interface CreateTeamRequest {
  code: string;
  name: string;
  description: string;
  logoUrl?: string;
}

export interface UpdateTeamRequest {
  code?: string;
  name?: string;
  description?: string;
  logoUrl?: string;
}

export interface TeamsPageResponse {
  content: AdminTeam[];
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

export class AdminTeamService {
  async getAllTeams(page: number = 0, size: number = 10): Promise<ApiResponse<TeamsPageResponse>> {
    return apiClient.get(`/v1/admin/teams?page=${page}&size=${size}`);
  }

  async createTeam(request: CreateTeamRequest): Promise<ApiResponse<AdminTeam>> {
    return apiClient.post('/v1/admin/teams', request);
  }

  async getTeam(id: number): Promise<ApiResponse<AdminTeam>> {
    return apiClient.get(`/v1/admin/teams/${id}`);
  }

  async getTeamByCode(code: string): Promise<ApiResponse<AdminTeam>> {
    return apiClient.get(`/v1/admin/teams/code/${code}`);
  }

  async updateTeam(id: number, request: UpdateTeamRequest): Promise<ApiResponse<AdminTeam>> {
    return apiClient.put(`/v1/admin/teams/${id}`, request);
  }

  async deleteTeam(id: number): Promise<ApiResponse<string>> {
    return apiClient.delete(`/v1/admin/teams/${id}`);
  }
}

export const adminTeamService = new AdminTeamService();