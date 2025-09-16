/**
 * Players API 모듈 - 선수 관련 모든 API 통합
 */

import { api } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import {
  Player,
  CreatePlayerRequest,
  UpdatePlayerRequest,
  ApiResponse,
  PageResponse,
  PageParams,
  SearchParams,
} from '../types';
import { QueryParams, RequestData } from '../../types/interfaces/api';

// Public Players API
export const playersApi = {
  // 선수 목록 조회 (페이징)
  getAll: (params?: PageParams): Promise<PageResponse<Player>> =>
    api.callEndpoint<PageResponse<Player>>(API_ENDPOINTS.PLAYERS.LIST, undefined, undefined, params as QueryParams),

  // ID로 선수 조회
  getById: (id: number): Promise<Player> =>
    api.callEndpoint<Player>(API_ENDPOINTS.PLAYERS.GET, { id }),

  // 활성 선수들 조회
  getActive: (): Promise<Player[]> =>
    api.callEndpoint<Player[]>(API_ENDPOINTS.PLAYERS.ACTIVE),
};

// Admin Players API  
export const adminPlayersApi = {
  // 선수 목록 조회 (페이징, 검색, 팀 필터)
  getAll: (teamId: number, params?: SearchParams): Promise<ApiResponse<PageResponse<Player>>> =>
    api.callEndpoint<ApiResponse<PageResponse<Player>>>(
      API_ENDPOINTS.ADMIN_PLAYERS.LIST,
      undefined,
      undefined,
      { teamId, ...params } as QueryParams
    ),

  // ID로 선수 조회
  getById: (id: number): Promise<ApiResponse<Player>> =>
    api.callEndpoint<ApiResponse<Player>>(API_ENDPOINTS.ADMIN_PLAYERS.GET, { id }),

  // 선수 생성
  create: (teamId: number, data: CreatePlayerRequest): Promise<ApiResponse<Player>> =>
    api.callEndpoint<ApiResponse<Player>>(
      API_ENDPOINTS.ADMIN_PLAYERS.CREATE, 
      undefined, 
      { ...data, teamId } as unknown as RequestData
    ),

  // 선수 수정
  update: (id: number, data: UpdatePlayerRequest): Promise<ApiResponse<Player>> =>
    api.callEndpoint<ApiResponse<Player>>(API_ENDPOINTS.ADMIN_PLAYERS.UPDATE, { id }, data as unknown as RequestData),

  // 선수 삭제
  delete: (id: number): Promise<ApiResponse<string>> =>
    api.callEndpoint<ApiResponse<string>>(API_ENDPOINTS.ADMIN_PLAYERS.DELETE, { id }),
};

// 통합 Players API (Public + Admin)
export const Players = {
  // Public API
  public: playersApi,
  
  // Admin API  
  admin: adminPlayersApi,
  
  // 편의 메서드들
  async searchByName(name: string, teamId?: number): Promise<Player[]> {
    if (teamId) {
      const response = await adminPlayersApi.getAll(teamId, { search: name });
      return response.data.content;
    } else {
      const response = await playersApi.getAll();
      return response.content.filter(player => 
        player.name.toLowerCase().includes(name.toLowerCase())
      );
    }
  },

  async getByPosition(position: string, teamId?: number): Promise<Player[]> {
    if (teamId) {
      const response = await adminPlayersApi.getAll(teamId);
      return response.data.content.filter(player => player.position === position);
    } else {
      const response = await playersApi.getAll();
      return response.content.filter(player => player.position === position);
    }
  },

  async isBackNumberTaken(backNumber: number, teamId: number, excludePlayerId?: number): Promise<boolean> {
    const response = await adminPlayersApi.getAll(teamId);
    return response.data.content.some(player => 
      player.backNumber === backNumber && player.id !== excludePlayerId
    );
  },

  // CRUD 헬퍼 (Admin)
  async createPlayer(teamId: number, data: CreatePlayerRequest): Promise<Player> {
    // 백넘버 중복 체크
    const isTaken = await this.isBackNumberTaken(data.backNumber, teamId);
    if (isTaken) {
      throw new Error(`백넘버 ${data.backNumber}는 이미 사용 중입니다.`);
    }

    const response = await adminPlayersApi.create(teamId, data);
    return response.data;
  },

  async updatePlayer(id: number, data: UpdatePlayerRequest): Promise<Player> {
    const response = await adminPlayersApi.update(id, data);
    return response.data;
  },

  async deletePlayer(id: number): Promise<void> {
    await adminPlayersApi.delete(id);
  },

  // 통계 메서드들
  async getTeamPlayerStats(teamId: number): Promise<{
    totalPlayers: number;
    byPosition: Record<string, number>;
    averageAge?: number;
  }> {
    const response = await adminPlayersApi.getAll(teamId);
    const players = response.data.content;
    
    const byPosition = players.reduce((acc, player) => {
      acc[player.position] = (acc[player.position] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalPlayers: players.length,
      byPosition,
    };
  },
};

export default Players;