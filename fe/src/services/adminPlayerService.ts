import { apiClient } from './api';

export interface AdminPlayer {
  id: number;
  name: string;
  position: string;
  backNumber: number;
  isActive: boolean;
  profileImageUrl?: string;
  team: {
    id: number;
    name: string;
    code: string;
  };
}

export interface CreatePlayerRequest {
  name: string;
  position: string;
  backNumber: number;
  isActive: boolean;
  profileImageUrl?: string;
}

export interface UpdatePlayerRequest {
  name?: string;
  position?: string;
  backNumber?: number;
  isActive?: boolean;
  profileImageUrl?: string;
}

export interface PlayersPageResponse {
  content: AdminPlayer[];
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

export class AdminPlayerService {
  async getAllPlayers(page: number = 0, size: number = 10, teamId: number): Promise<ApiResponse<PlayersPageResponse>> {
    return apiClient.get(`/v1/admin/players?page=${page}&size=${size}&teamId=${teamId}`);
  }

  async createPlayer(teamId: number, request: CreatePlayerRequest): Promise<ApiResponse<AdminPlayer>> {
    return apiClient.post(`/v1/admin/players?teamId=${teamId}`, request);
  }

  async getPlayer(id: number): Promise<ApiResponse<AdminPlayer>> {
    return apiClient.get(`/v1/admin/players/${id}`);
  }

  async updatePlayer(id: number, request: UpdatePlayerRequest): Promise<ApiResponse<AdminPlayer>> {
    return apiClient.put(`/v1/admin/players/${id}`, request);
  }

  async deletePlayer(id: number): Promise<ApiResponse<string>> {
    return apiClient.delete(`/v1/admin/players/${id}`);
  }
}

export const adminPlayerService = new AdminPlayerService();