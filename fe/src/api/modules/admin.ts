/**
 * Admin API 모듈 - 관리자 대시보드 및 통합 관리 API
 */

import { api } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import {
  DashboardStats,
  Inquiry,
  UpdateInquiryStatusRequest,
  ApiResponse,
  PageResponse,
  PageParams,
} from '../types';

// Admin Dashboard API
export const adminDashboardApi = {
  // 대시보드 통계
  getStats: (): Promise<DashboardStats> =>
    api.callEndpoint<DashboardStats>(API_ENDPOINTS.ADMIN.DASHBOARD),

  // 팀 통계
  getTeamStats: (teamId: number): Promise<ApiResponse<any>> =>
    api.callEndpoint<ApiResponse<any>>(API_ENDPOINTS.ADMIN.TEAM_STATS, { teamId }),
};

// Admin Inquiries API
export const adminInquiriesApi = {
  // 문의 목록 조회 (페이징)
  getAll: (params?: PageParams): Promise<ApiResponse<PageResponse<Inquiry>>> =>
    api.callEndpoint<ApiResponse<PageResponse<Inquiry>>>(
      API_ENDPOINTS.ADMIN_INQUIRIES.LIST,
      undefined,
      undefined,
      params
    ),

  // ID로 문의 조회
  getById: (id: number): Promise<ApiResponse<Inquiry>> =>
    api.callEndpoint<ApiResponse<Inquiry>>(API_ENDPOINTS.ADMIN_INQUIRIES.GET, { id }),

  // 상태별 문의 조회
  getByStatus: (status: Inquiry['status'], params?: PageParams): Promise<ApiResponse<PageResponse<Inquiry>>> =>
    api.callEndpoint<ApiResponse<PageResponse<Inquiry>>>(
      API_ENDPOINTS.ADMIN_INQUIRIES.BY_STATUS,
      { status },
      undefined,
      params
    ),

  // 문의 통계
  getStats: (): Promise<ApiResponse<{
    total: number;
    pending: number;
    inProgress: number;
    resolved: number;
    closed: number;
  }>> =>
    api.callEndpoint<ApiResponse<any>>(API_ENDPOINTS.ADMIN_INQUIRIES.STATS),

  // 최근 문의들
  getRecent: (limit: number = 5): Promise<ApiResponse<Inquiry[]>> =>
    api.callEndpoint<ApiResponse<Inquiry[]>>(
      API_ENDPOINTS.ADMIN_INQUIRIES.RECENT,
      undefined,
      undefined,
      { limit }
    ),

  // 문의 상태 업데이트
  updateStatus: (id: number, data: UpdateInquiryStatusRequest): Promise<ApiResponse<Inquiry>> =>
    api.callEndpoint<ApiResponse<Inquiry>>(
      API_ENDPOINTS.ADMIN_INQUIRIES.UPDATE_STATUS,
      { id },
      data
    ),
};

// Admin Tenants API (Multi-tenant)
export const adminTenantsApi = {
  // 모든 테넌트 조회
  getAll: (): Promise<ApiResponse<any[]>> =>
    api.callEndpoint<ApiResponse<any[]>>(API_ENDPOINTS.TENANTS.LIST),

  // 코드로 테넌트 조회
  getByCode: (code: string): Promise<ApiResponse<any>> =>
    api.callEndpoint<ApiResponse<any>>(API_ENDPOINTS.TENANTS.GET, { code }),

  // 테넌트 대시보드
  getDashboard: (code: string): Promise<ApiResponse<any>> =>
    api.callEndpoint<ApiResponse<any>>(API_ENDPOINTS.TENANTS.DASHBOARD, { code }),

  // 테넌트 선수들
  getPlayers: (code: string, params?: PageParams): Promise<ApiResponse<any>> =>
    api.callEndpoint<ApiResponse<any>>(
      API_ENDPOINTS.TENANTS.PLAYERS,
      { code },
      undefined,
      params
    ),

  // 테넌트 구장들
  getStadiums: (code: string, params?: PageParams): Promise<ApiResponse<any>> =>
    api.callEndpoint<ApiResponse<any>>(
      API_ENDPOINTS.TENANTS.STADIUMS,
      { code },
      undefined,
      params
    ),

  // 테넌트 설정 업데이트
  updateSettings: (code: string, settings: any): Promise<ApiResponse<string>> =>
    api.callEndpoint<ApiResponse<string>>(
      API_ENDPOINTS.TENANTS.UPDATE_SETTINGS,
      { code },
      settings
    ),

  // 테넌트 생성
  create: (data: any): Promise<ApiResponse<string>> =>
    api.callEndpoint<ApiResponse<string>>(API_ENDPOINTS.TENANTS.CREATE, undefined, data),
};

// 통합 Admin API
export const Admin = {
  // Dashboard
  dashboard: adminDashboardApi,
  
  // Inquiries
  inquiries: adminInquiriesApi,
  
  // Tenants
  tenants: adminTenantsApi,
  
  // 편의 메서드들
  async getSystemOverview(): Promise<{
    dashboard: DashboardStats;
    inquiryStats: any;
    recentInquiries: Inquiry[];
  }> {
    const [dashboard, inquiryStats, recentInquiries] = await Promise.all([
      adminDashboardApi.getStats(),
      adminInquiriesApi.getStats(),
      adminInquiriesApi.getRecent(5),
    ]);

    return {
      dashboard,
      inquiryStats: inquiryStats.data,
      recentInquiries: recentInquiries.data,
    };
  },

  async processInquiry(id: number, status: Inquiry['status'], responseMessage?: string): Promise<Inquiry> {
    const response = await adminInquiriesApi.updateStatus(id, { status, responseMessage });
    return response.data;
  },

  async getPendingInquiriesCount(): Promise<number> {
    const response = await adminInquiriesApi.getStats();
    return response.data.pending;
  },

  // 테넌트 관리
  async createTenant(data: {
    code: string;
    name: string;
    description: string;
    settings?: any;
  }): Promise<string> {
    const response = await adminTenantsApi.create(data);
    return response.data;
  },

  async getTenantOverview(code: string): Promise<{
    info: any;
    dashboard: any;
    players: any[];
    stadiums: any[];
  }> {
    const [info, dashboard, players, stadiums] = await Promise.all([
      adminTenantsApi.getByCode(code),
      adminTenantsApi.getDashboard(code),
      adminTenantsApi.getPlayers(code),
      adminTenantsApi.getStadiums(code),
    ]);

    return {
      info: info.data,
      dashboard: dashboard.data,
      players: players.data,
      stadiums: stadiums.data,
    };
  },
};

export default Admin;