import { apiClient } from './api';
import { PlayerDto } from '../types/player';
import { ApiResponse, PageResponse } from '../types/api';

export class PlayerService {
  async getPlayers(page: number = 0, size: number = 10): Promise<PageResponse<PlayerDto>> {
    const response = await apiClient.get<ApiResponse<PageResponse<PlayerDto>>>(
      `/v1/players?page=${page}&size=${size}`
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || '선수 목록을 불러오는데 실패했습니다');
    }
    
    return response.data;
  }

  async getPlayer(id: number): Promise<PlayerDto> {
    const response = await apiClient.get<ApiResponse<PlayerDto>>(`/v1/players/${id}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || '선수 정보를 불러오는데 실패했습니다');
    }
    
    return response.data;
  }

  async getActivePlayers(): Promise<PlayerDto[]> {
    const response = await apiClient.get<ApiResponse<PlayerDto[]>>('/v1/players/active');
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || '활성 선수 목록을 불러오는데 실패했습니다');
    }
    
    return response.data;
  }
}

export const playerService = new PlayerService();