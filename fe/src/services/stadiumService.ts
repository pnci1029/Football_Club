import { apiClient } from './api';
import { StadiumDto } from '../types/stadium';
import { ApiResponse, PageResponse } from '../types/api';

export class StadiumService {
  async getStadiums(page: number = 0, size: number = 10): Promise<PageResponse<StadiumDto>> {
    const response = await apiClient.get<ApiResponse<PageResponse<StadiumDto>>>(
      `/api/v1/stadiums?page=${page}&size=${size}`
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || '경기장 목록을 불러오는데 실패했습니다');
    }
    
    return response.data;
  }

  async getStadium(id: number): Promise<StadiumDto> {
    const response = await apiClient.get<ApiResponse<StadiumDto>>(`/api/v1/stadiums/${id}`);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || '경기장 정보를 불러오는데 실패했습니다');
    }
    
    return response.data;
  }

  async searchStadiums(params: { name?: string; address?: string }): Promise<StadiumDto[]> {
    const searchParams = new URLSearchParams();
    if (params.name) searchParams.append('name', params.name);
    if (params.address) searchParams.append('address', params.address);
    
    const response = await apiClient.get<ApiResponse<StadiumDto[]>>(
      `/api/v1/stadiums/search?${searchParams.toString()}`
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || '경기장 검색에 실패했습니다');
    }
    
    return response.data;
  }
}

export const stadiumService = new StadiumService();