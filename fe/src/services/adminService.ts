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
  AdminPageResponse,
  AdminAccountDto,
  CreateAdminRequest,
  UpdateAdminRequest,
  AdminCommunityPost,
  AdminCommunityPostDetail
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

  // 관리자 계정 관리 (마스터 전용)
  async getAllAdmins(page: number = 0, size: number = 20): Promise<AdminPageResponse<AdminAccountDto>> {
    const response = await apiClient.get<AdminApiResponse<AdminPageResponse<AdminAccountDto>>>(`/api/v1/admin/management/admins?page=${page}&size=${size}`);
    return response.data;
  }

  async getAdminById(adminId: number): Promise<AdminAccountDto> {
    const response = await apiClient.get<AdminApiResponse<AdminAccountDto>>(`/api/v1/admin/management/admins/${adminId}`);
    return response.data;
  }

  async createAdmin(adminData: CreateAdminRequest): Promise<AdminAccountDto> {
    const response = await apiClient.post<AdminApiResponse<AdminAccountDto>>('/api/v1/admin/management/admins', adminData);
    return response.data;
  }

  async updateAdmin(adminId: number, adminData: UpdateAdminRequest): Promise<AdminAccountDto> {
    const response = await apiClient.put<AdminApiResponse<AdminAccountDto>>(`/api/v1/admin/management/admins/${adminId}`, adminData);
    return response.data;
  }

  async deleteAdmin(adminId: number): Promise<string> {
    const response = await apiClient.delete<AdminApiResponse<string>>(`/api/v1/admin/management/admins/${adminId}`);
    return response.data;
  }

  async activateAdmin(adminId: number): Promise<string> {
    const response = await apiClient.put<AdminApiResponse<string>>(`/api/v1/admin/management/admins/${adminId}/activate`, {});
    return response.data;
  }

  async deactivateAdmin(adminId: number): Promise<string> {
    const response = await apiClient.put<AdminApiResponse<string>>(`/api/v1/admin/management/admins/${adminId}/deactivate`, {});
    return response.data;
  }

  // 커뮤니티 관리 (관리자용)
  async getCommunityPosts(
    page: number = 0, 
    size: number = 20,
    teamCode?: string,
    category?: string,
    isActive?: boolean
  ): Promise<AdminPageResponse<AdminCommunityPost>> {
    let url = `/api/v1/admin/community/posts?page=${page}&size=${size}`;
    if (teamCode) url += `&teamCode=${teamCode}`;
    if (category) url += `&category=${category}`;
    if (isActive !== undefined) url += `&isActive=${isActive}`;
    
    const response = await apiClient.get<AdminApiResponse<AdminPageResponse<AdminCommunityPost>>>(url);
    return response.data;
  }

  async getCommunityPostDetail(postId: number): Promise<AdminCommunityPostDetail> {
    const response = await apiClient.get<AdminApiResponse<AdminCommunityPostDetail>>(`/api/v1/admin/community/posts/${postId}`);
    return response.data;
  }

  async activateCommunityPost(postId: number): Promise<string> {
    const response = await apiClient.put<AdminApiResponse<string>>(`/api/v1/admin/community/posts/${postId}/activate`, {});
    return response.data;
  }

  async deactivateCommunityPost(postId: number): Promise<string> {
    const response = await apiClient.put<AdminApiResponse<string>>(`/api/v1/admin/community/posts/${postId}/deactivate`, {});
    return response.data;
  }

  async deleteCommunityPost(postId: number): Promise<string> {
    const response = await apiClient.delete<AdminApiResponse<string>>(`/api/v1/admin/community/posts/${postId}`);
    return response.data;
  }

  async activateCommunityComment(commentId: number): Promise<string> {
    const response = await apiClient.put<AdminApiResponse<string>>(`/api/v1/admin/community/comments/${commentId}/activate`, {});
    return response.data;
  }

  async deactivateCommunityComment(commentId: number): Promise<string> {
    const response = await apiClient.put<AdminApiResponse<string>>(`/api/v1/admin/community/comments/${commentId}/deactivate`, {});
    return response.data;
  }

  async deleteCommunityComment(commentId: number): Promise<string> {
    const response = await apiClient.delete<AdminApiResponse<string>>(`/api/v1/admin/community/comments/${commentId}`);
    return response.data;
  }
}

export const adminService = new AdminService();