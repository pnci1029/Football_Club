/**
 * Stadiums API 모듈 - 구장 관련 모든 API 통합
 */

import { api } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import {
  Stadium,
  CreateStadiumRequest,
  UpdateStadiumRequest,
  ApiResponse,
  PageResponse,
  PageParams,
} from '../types';

// Public Stadiums API
export const stadiumsApi = {
  // 구장 목록 조회 (페이징)
  getAll: (params?: PageParams): Promise<PageResponse<Stadium>> =>
    api.callEndpoint<PageResponse<Stadium>>(API_ENDPOINTS.STADIUMS.LIST, undefined, undefined, params),

  // ID로 구장 조회
  getById: (id: number): Promise<Stadium> =>
    api.callEndpoint<Stadium>(API_ENDPOINTS.STADIUMS.GET, { id }),
};

// Admin Stadiums API
export const adminStadiumsApi = {
  // 구장 목록 조회 (페이징)
  getAll: (params?: PageParams): Promise<ApiResponse<PageResponse<Stadium>>> =>
    api.callEndpoint<ApiResponse<PageResponse<Stadium>>>(
      API_ENDPOINTS.ADMIN_STADIUMS.LIST, 
      undefined, 
      undefined, 
      params
    ),

  // ID로 구장 조회
  getById: (id: number): Promise<ApiResponse<Stadium>> =>
    api.callEndpoint<ApiResponse<Stadium>>(API_ENDPOINTS.ADMIN_STADIUMS.GET, { id }),

  // 구장 생성
  create: (data: CreateStadiumRequest, teamId?: number): Promise<ApiResponse<Stadium>> =>
    api.callEndpoint<ApiResponse<Stadium>>(
      API_ENDPOINTS.ADMIN_STADIUMS.CREATE, 
      undefined, 
      { ...data, teamId }
    ),

  // 구장 수정
  update: (id: number, data: UpdateStadiumRequest): Promise<ApiResponse<Stadium>> =>
    api.callEndpoint<ApiResponse<Stadium>>(API_ENDPOINTS.ADMIN_STADIUMS.UPDATE, { id }, data),

  // 구장 삭제
  delete: (id: number): Promise<ApiResponse<string>> =>
    api.callEndpoint<ApiResponse<string>>(API_ENDPOINTS.ADMIN_STADIUMS.DELETE, { id }),
};

// 통합 Stadiums API (Public + Admin)
export const Stadiums = {
  // Public API
  public: stadiumsApi,
  
  // Admin API
  admin: adminStadiumsApi,
  
  // 편의 메서드들
  async searchByName(name: string): Promise<Stadium[]> {
    const response = await stadiumsApi.getAll();
    return response.content.filter(stadium =>
      stadium.name.toLowerCase().includes(name.toLowerCase())
    );
  },

  async searchByAddress(address: string): Promise<Stadium[]> {
    const response = await stadiumsApi.getAll();
    return response.content.filter(stadium =>
      stadium.address.toLowerCase().includes(address.toLowerCase())
    );
  },

  async findNearby(latitude: number, longitude: number, radiusKm: number = 10): Promise<Stadium[]> {
    const response = await stadiumsApi.getAll();
    
    return response.content.filter(stadium => {
      const distance = this.calculateDistance(
        latitude, longitude,
        stadium.latitude, stadium.longitude
      );
      return distance <= radiusKm;
    });
  },

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // 지구 반지름 (km)
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d;
  },

  deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  },

  // CRUD 헬퍼 (Admin)
  async createStadium(data: CreateStadiumRequest, teamId?: number): Promise<Stadium> {
    // 주소 중복 체크
    const existing = await this.searchByAddress(data.address);
    if (existing.length > 0) {
      throw new Error(`이미 해당 주소에 등록된 구장이 있습니다: ${existing[0].name}`);
    }

    const response = await adminStadiumsApi.create(data, teamId);
    return response.data;
  },

  async updateStadium(id: number, data: UpdateStadiumRequest): Promise<Stadium> {
    const response = await adminStadiumsApi.update(id, data);
    return response.data;
  },

  async deleteStadium(id: number): Promise<void> {
    await adminStadiumsApi.delete(id);
  },

  // 통계 메서드들
  async getStadiumStats(): Promise<{
    totalStadiums: number;
    totalCapacity: number;
    averageCapacity: number;
    byRegion: Record<string, number>;
  }> {
    const response = await stadiumsApi.getAll();
    const stadiums = response.content;
    
    const totalCapacity = stadiums.reduce((sum, stadium) => 
      sum + (stadium.capacity || 0), 0
    );
    
    const byRegion = stadiums.reduce((acc, stadium) => {
      const region = this.extractRegion(stadium.address);
      acc[region] = (acc[region] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalStadiums: stadiums.length,
      totalCapacity,
      averageCapacity: totalCapacity / stadiums.length,
      byRegion,
    };
  },

  extractRegion(address: string): string {
    // 간단한 지역 추출 로직 (시/도 단위)
    const match = address.match(/^[^시도]*[시도]/);
    return match ? match[0] : '기타';
  },
};

export default Stadiums;