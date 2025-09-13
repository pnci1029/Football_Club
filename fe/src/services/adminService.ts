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
  capacity?: number;
  latitude?: number;
  longitude?: number;
  hourlyRate: number;
  contactNumber?: string;
  facilities: string[];
  availableHours: string;
  imageUrls: string[];
  teamId?: number;
  teamName?: string;
}

export interface CreateTeamData {
  code: string;
  name: string;
  description: string;
  logoUrl?: string;
}

class AdminService {
  // 대시보드 통계 조회
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get<{ success: boolean; data: DashboardStats }>('/api/v1/admin/teams/dashboard-stats');
    return response.data;
  }

  // 특정 팀 통계 조회
  async getTeamStats(teamId: number): Promise<any> {
    const response = await apiClient.get<{ success: boolean; data: any }>(`/api/v1/admin/teams/${teamId}/stats`);
    return response.data;
  }

  // 팀별 선수 목록 조회
  async getPlayersByTeam(teamId: number, page: number = 0, size: number = 10): Promise<{ content: PlayerDto[], totalElements: number }> {
    const response = await apiClient.get<{ success: boolean; data: { content: PlayerDto[], totalElements: number } }>(`/api/v1/admin/players?teamId=${teamId}&page=${page}&size=${size}`);
    return response.data;
  }

  // 팀별 구장 목록 조회
  async getStadiumsByTeam(teamId: number, page: number = 0, size: number = 10): Promise<{ content: StadiumDto[], totalElements: number }> {
    const response = await apiClient.get<{ success: boolean; data: { content: StadiumDto[], totalElements: number } }>(`/api/v1/admin/stadiums?teamId=${teamId}&page=${page}&size=${size}`);
    return response.data;
  }

  // 전체 선수 목록 조회
  async getAllPlayers(page: number = 0, size: number = 10): Promise<{ content: PlayerDto[], totalElements: number }> {
    const response = await apiClient.get<{ success: boolean; data: { content: PlayerDto[], totalElements: number } }>(`/api/v1/admin/players?page=${page}&size=${size}`);
    return response.data;
  }

  // 전체 구장 목록 조회
  async getAllStadiums(page: number = 0, size: number = 10): Promise<{ content: StadiumDto[], totalElements: number }> {
    const response = await apiClient.get<{ success: boolean; data: { content: StadiumDto[], totalElements: number } }>(`/api/v1/admin/stadiums?page=${page}&size=${size}`);
    return response.data;
  }

  // 팀 목록 조회
  async getAllTeams(page: number = 0, size: number = 20): Promise<{ content: TeamStats[], totalElements: number }> {
    const response = await apiClient.get<{ success: boolean; data: { content: TeamStats[], totalElements: number } }>(`/api/v1/admin/teams?page=${page}&size=${size}`);
    return response.data;
  }

  // 편의 메소드들 - 테스트에서 사용
  async getTeams(): Promise<{ content: TeamStats[], totalElements: number }> {
    return this.getAllTeams();
  }

  async getPlayers(): Promise<{ content: PlayerDto[], totalElements: number }> {
    return this.getAllPlayers();
  }

  // 테넌트 관리 API
  async getAllTenants(): Promise<any[]> {
    const response = await apiClient.get<{ success: boolean; data: any[] }>('/api/v1/admin/tenants');
    return response.data;
  }

  async getTenantByCode(teamCode: string): Promise<any> {
    const response = await apiClient.get<{ success: boolean; data: any }>(`/api/v1/admin/tenants/${teamCode}`);
    return response.data;
  }

  async getTenantDashboard(teamCode: string): Promise<any> {
    const response = await apiClient.get<{ success: boolean; data: any }>(`/api/v1/admin/tenants/${teamCode}/dashboard`);
    return response.data;
  }

  async getTenantPlayers(teamCode: string, page: number = 0, size: number = 10): Promise<any> {
    const response = await apiClient.get<{ success: boolean; data: any }>(`/api/v1/admin/tenants/${teamCode}/players?page=${page}&size=${size}`);
    return response.data;
  }

  async getTenantStadiums(teamCode: string, page: number = 0, size: number = 10): Promise<any> {
    const response = await apiClient.get<{ success: boolean; data: any }>(`/api/v1/admin/tenants/${teamCode}/stadiums?page=${page}&size=${size}`);
    return response.data;
  }

  async updateTenantSettings(teamCode: string, settings: any): Promise<string> {
    const response = await apiClient.put<{ success: boolean; data: string }>(`/api/v1/admin/tenants/${teamCode}/settings`, settings);
    return response.data;
  }

  async createTenant(tenantData: any): Promise<string> {
    const response = await apiClient.post<{ success: boolean; data: string }>('/api/v1/admin/tenants', tenantData);
    return response.data;
  }

  // 새 팀 생성
  async createTeam(teamData: CreateTeamData): Promise<TeamStats> {
    const response = await apiClient.post<{ success: boolean; data: TeamStats }>('/api/v1/admin/teams', teamData);
    return response.data;
  }
}

export const adminService = new AdminService();