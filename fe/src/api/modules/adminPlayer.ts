/**
 * Admin Player API 모듈 - 관리자 전용 선수 관리 API
 */

import { api } from '../client';
import { PlayerDto } from '../../types/player';

export interface CreatePlayerRequest {
  name: string;
  position: string;
  backNumber?: number;
  profileImageUrl?: string;
  isActive: boolean;
}

export interface UpdatePlayerRequest {
  name?: string;
  position?: string;
  backNumber?: number;
  profileImageUrl?: string;
  isActive?: boolean;
}

export const adminPlayerApi = {
  // 관리자용 선수 생성
  createPlayer: (teamId: number, data: CreatePlayerRequest): Promise<PlayerDto> => 
    api.callEndpoint<PlayerDto>({
      method: 'POST',
      path: `/v1/admin/players?teamId=${teamId}`,
      requiresAuth: true,
    }, undefined, data as CreatePlayerRequest & Record<string, unknown>),

  // 관리자용 선수 수정
  updatePlayer: (playerId: number, data: UpdatePlayerRequest): Promise<PlayerDto> => 
    api.callEndpoint<PlayerDto>({
      method: 'PUT',
      path: `/v1/admin/players/${playerId}`,
      requiresAuth: true,
    }, undefined, data as UpdatePlayerRequest & Record<string, unknown>),

  // 관리자용 선수 삭제
  deletePlayer: (playerId: number): Promise<string> => 
    api.callEndpoint<string>({
      method: 'DELETE',
      path: `/v1/admin/players/${playerId}`,
      requiresAuth: true,
    }),
};

export default adminPlayerApi;