/**
 * Teams API 모듈 - 팀 관련 모든 API 통합
 */

import { api } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import {
  Team,
  TeamStats,
  CreateTeamRequest,
  UpdateTeamRequest,
  ApiResponse,
  PageResponse,
  PageParams,
} from '../types';
import { QueryParams, RequestData } from '../../types/interfaces/api';

// Public Teams API
export const teamsApi = {
  // 모든 팀 조회
  getAll: (): Promise<Team[]> => 
    api.callEndpoint<Team[]>(API_ENDPOINTS.TEAMS.LIST),

  // ID로 팀 조회
  getById: (id: number): Promise<Team> =>
    api.callEndpoint<Team>(API_ENDPOINTS.TEAMS.GET, { id }),

  // 코드로 팀 조회
  getByCode: (code: string): Promise<Team> =>
    api.callEndpoint<Team>(API_ENDPOINTS.TEAMS.GET_BY_CODE, { code }),
};

// Admin Teams API
export const adminTeamsApi = {
  // 모든 팀 조회 (페이징)
  getAll: (params?: PageParams): Promise<ApiResponse<PageResponse<TeamStats>>> =>
    api.callEndpoint<ApiResponse<PageResponse<TeamStats>>>(
      API_ENDPOINTS.ADMIN_TEAMS.LIST, 
      undefined, 
      undefined, 
      params as QueryParams
    ),

  // ID로 팀 조회
  getById: (id: number): Promise<ApiResponse<Team>> =>
    api.callEndpoint<ApiResponse<Team>>(API_ENDPOINTS.ADMIN_TEAMS.GET, { id }),

  // 코드로 팀 조회
  getByCode: (code: string): Promise<ApiResponse<Team>> =>
    api.callEndpoint<ApiResponse<Team>>(API_ENDPOINTS.ADMIN_TEAMS.GET_BY_CODE, { code }),

  // 팀 생성
  create: (data: CreateTeamRequest): Promise<ApiResponse<Team>> =>
    api.callEndpoint<ApiResponse<Team>>(API_ENDPOINTS.ADMIN_TEAMS.CREATE, undefined, data as unknown as RequestData),

  // 팀 수정
  update: (id: number, data: UpdateTeamRequest): Promise<ApiResponse<Team>> =>
    api.callEndpoint<ApiResponse<Team>>(API_ENDPOINTS.ADMIN_TEAMS.UPDATE, { id }, data as unknown as RequestData),

  // 팀 삭제
  delete: (id: number): Promise<ApiResponse<string>> =>
    api.callEndpoint<ApiResponse<string>>(API_ENDPOINTS.ADMIN_TEAMS.DELETE, { id }),

  // 팀 통계
  getStats: (id: number): Promise<ApiResponse<any>> =>
    api.callEndpoint<ApiResponse<any>>(API_ENDPOINTS.ADMIN.TEAM_STATS, { id }),
};

// 통합 Teams API (Public + Admin)
export const Teams = {
  // Public API
  public: teamsApi,
  
  // Admin API
  admin: adminTeamsApi,
  
  // 편의 메서드들
  async search(query: string): Promise<Team[]> {
    const allTeams = await teamsApi.getAll();
    return allTeams.filter(team => 
      team.name.toLowerCase().includes(query.toLowerCase()) ||
      team.code.toLowerCase().includes(query.toLowerCase())
    );
  },

  async exists(code: string): Promise<boolean> {
    try {
      await teamsApi.getByCode(code);
      return true;
    } catch {
      return false;
    }
  },

  // CRUD 헬퍼 (Admin)
  async createTeam(data: CreateTeamRequest): Promise<Team> {
    const response = await adminTeamsApi.create(data);
    return response.data;
  },

  async updateTeam(id: number, data: UpdateTeamRequest): Promise<Team> {
    const response = await adminTeamsApi.update(id, data);
    return response.data;
  },

  async deleteTeam(id: number): Promise<void> {
    await adminTeamsApi.delete(id);
  },
};

export default Teams;