import { apiClient } from './api';
import { 
  DashboardStats, 
  TeamStats, 
  PlayerDto, 
  StadiumDto, 
  TenantInfo, 
  TenantDashboard, 
  TenantSettings, 
  CreateTenantData,
  AdminApiResponse,
  AdminPageResponse
} from '../types/interfaces/admin/index';

// Re-export types that are needed elsewhere  
export type { StadiumDto, PlayerDto, TeamStats, DashboardStats } from '../types/interfaces/admin/index';

export interface CreateTeamData {
  code: string;
  name: string;
  description: string;
  logoUrl?: string;
}

class AdminService {
  // 대시보드 통계 조회
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get<AdminApiResponse<DashboardStats>>('/api/v1/admin/teams/dashboard-stats');
    return response.data;
  }

  // 특정 팀 통계 조회
  async getTeamStats(teamId: number): Promise<TeamStats> {
    const response = await apiClient.get<AdminApiResponse<TeamStats>>(`/api/v1/admin/teams/${teamId}/stats`);
    return response.data;
  }

  // 팀별 선수 목록 조회
  async getPlayersByTeam(teamId: number, page: number = 0, size: number = 10): Promise<AdminPageResponse<PlayerDto>> {
    const response = await apiClient.get<AdminApiResponse<AdminPageResponse<PlayerDto>>>(`/api/v1/admin/players?teamId=${teamId}&page=${page}&size=${size}`);
    return response.data;
  }

  // 팀별 구장 목록 조회
  async getStadiumsByTeam(teamId: number, page: number = 0, size: number = 10): Promise<AdminPageResponse<StadiumDto>> {
    const response = await apiClient.get<AdminApiResponse<AdminPageResponse<StadiumDto>>>(`/api/v1/admin/stadiums?teamId=${teamId}&page=${page}&size=${size}`);
    return response.data;
  }

  // 전체 선수 목록 조회
  async getAllPlayers(page: number = 0, size: number = 10): Promise<AdminPageResponse<PlayerDto>> {
    const response = await apiClient.get<AdminApiResponse<AdminPageResponse<PlayerDto>>>(`/api/v1/admin/players?page=${page}&size=${size}`);
    return response.data;
  }

  // 전체 구장 목록 조회
  async getAllStadiums(page: number = 0, size: number = 10): Promise<AdminPageResponse<StadiumDto>> {
    const response = await apiClient.get<AdminApiResponse<AdminPageResponse<StadiumDto>>>(`/api/v1/admin/stadiums?page=${page}&size=${size}`);
    return response.data;
  }

  // 팀 목록 조회
  async getAllTeams(page: number = 0, size: number = 20): Promise<AdminPageResponse<TeamStats>> {
    const response = await apiClient.get<AdminApiResponse<AdminPageResponse<TeamStats>>>(`/api/v1/admin/teams?page=${page}&size=${size}`);
    return response.data;
  }

  // 편의 메소드들 - 테스트에서 사용
  async getTeams(): Promise<AdminPageResponse<TeamStats>> {
    return this.getAllTeams();
  }

  async getPlayers(): Promise<AdminPageResponse<PlayerDto>> {
    return this.getAllPlayers();
  }

  // 테넌트 관리 API
  async getAllTenants(): Promise<TenantInfo[]> {
    const response = await apiClient.get<AdminApiResponse<TenantInfo[]>>('/api/v1/admin/tenants');
    return response.data;
  }

  async getTenantByCode(teamCode: string): Promise<TenantInfo> {
    const response = await apiClient.get<AdminApiResponse<TenantInfo>>(`/api/v1/admin/tenants/${teamCode}`);
    return response.data;
  }

  async getTenantDashboard(teamCode: string): Promise<TenantDashboard> {
    const response = await apiClient.get<AdminApiResponse<TenantDashboard>>(`/api/v1/admin/tenants/${teamCode}/dashboard`);
    return response.data;
  }

  async getTenantPlayers(teamCode: string, page: number = 0, size: number = 10): Promise<AdminPageResponse<PlayerDto>> {
    const response = await apiClient.get<AdminApiResponse<AdminPageResponse<PlayerDto>>>(`/api/v1/admin/tenants/${teamCode}/players?page=${page}&size=${size}`);
    return response.data;
  }

  async getTenantStadiums(teamCode: string, page: number = 0, size: number = 10): Promise<AdminPageResponse<StadiumDto>> {
    const response = await apiClient.get<AdminApiResponse<AdminPageResponse<StadiumDto>>>(`/api/v1/admin/tenants/${teamCode}/stadiums?page=${page}&size=${size}`);
    return response.data;
  }

  async updateTenantSettings(teamCode: string, settings: TenantSettings): Promise<string> {
    const response = await apiClient.put<AdminApiResponse<string>>(`/api/v1/admin/tenants/${teamCode}/settings`, settings);
    return response.data;
  }

  async createTenant(tenantData: CreateTenantData): Promise<string> {
    const response = await apiClient.post<AdminApiResponse<string>>('/api/v1/admin/tenants', tenantData);
    return response.data;
  }

  // 새 팀 생성
  async createTeam(teamData: CreateTeamData): Promise<TeamStats> {
    const response = await apiClient.post<AdminApiResponse<TeamStats>>('/api/v1/admin/teams', teamData);
    return response.data;
  }
}

export const adminService = new AdminService();