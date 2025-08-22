import { apiClient } from './api';

export interface TeamStats {
  id: number;
  name: string;
  code: string;
  playerCount: number;
  stadiumCount: number;
}

export interface DashboardStats {
  totalTeams: number;
  totalPlayers: number;
  totalStadiums: number;
  totalMatches: number;
  teams: TeamStats[];
}

export interface PlayerDto {
  id: number;
  name: string;
  position: string;
  uniformNumber: number;
  teamId: number;
  teamName: string;
}

export interface StadiumDto {
  id: number;
  name: string;
  address: string;
  capacity: number;
  teamId?: number;
  teamName?: string;
}

class AdminService {
  // 대시보드 통계 조회
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get<{ success: boolean; data: DashboardStats }>('/v1/admin/teams/dashboard-stats');
    return response.data;
  }

  // 특정 팀 통계 조회
  async getTeamStats(teamId: number): Promise<any> {
    const response = await apiClient.get<{ success: boolean; data: any }>(`/v1/admin/teams/${teamId}/stats`);
    return response.data;
  }

  // 팀별 선수 목록 조회
  async getPlayersByTeam(teamId: number, page: number = 0, size: number = 10): Promise<{ content: PlayerDto[], totalElements: number }> {
    const response = await apiClient.get<{ success: boolean; data: { content: PlayerDto[], totalElements: number } }>(`/v1/admin/players?teamId=${teamId}&page=${page}&size=${size}`);
    return response.data;
  }

  // 팀별 구장 목록 조회
  async getStadiumsByTeam(teamId: number, page: number = 0, size: number = 10): Promise<{ content: StadiumDto[], totalElements: number }> {
    const response = await apiClient.get<{ success: boolean; data: { content: StadiumDto[], totalElements: number } }>(`/v1/admin/stadiums?teamId=${teamId}&page=${page}&size=${size}`);
    return response.data;
  }

  // 전체 선수 목록 조회
  async getAllPlayers(page: number = 0, size: number = 10): Promise<{ content: PlayerDto[], totalElements: number }> {
    const response = await apiClient.get<{ success: boolean; data: { content: PlayerDto[], totalElements: number } }>(`/v1/admin/players?page=${page}&size=${size}`);
    return response.data;
  }

  // 전체 구장 목록 조회
  async getAllStadiums(page: number = 0, size: number = 10): Promise<{ content: StadiumDto[], totalElements: number }> {
    const response = await apiClient.get<{ success: boolean; data: { content: StadiumDto[], totalElements: number } }>(`/v1/admin/stadiums?page=${page}&size=${size}`);
    return response.data;
  }

  // 팀 목록 조회
  async getAllTeams(page: number = 0, size: number = 20): Promise<{ content: TeamStats[], totalElements: number }> {
    const response = await apiClient.get<{ success: boolean; data: { content: TeamStats[], totalElements: number } }>(`/v1/admin/teams?page=${page}&size=${size}`);
    return response.data;
  }
}

export const adminService = new AdminService();