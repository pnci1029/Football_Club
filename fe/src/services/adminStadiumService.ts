import { apiClient } from './api';

export interface AdminStadium {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  hourlyRate: number;
  contactNumber?: string;
  facilities: string[];
  availableHours: string;
  availableDays: string[];
  imageUrls: string[];
}

export interface CreateStadiumRequest {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  hourlyRate: number;
  contactNumber?: string;
  facilities: string[];
  availableHours: string;
  availableDays: string[];
  imageUrls: string[];
}

export interface UpdateStadiumRequest {
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  hourlyRate?: number;
  contactNumber?: string;
  facilities?: string[];
  availableHours?: string;
  availableDays?: string[];
  imageUrls?: string[];
}

export interface StadiumsPageResponse {
  content: AdminStadium[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  errorCode?: string;
  message?: string;
}

export class AdminStadiumService {
  async getAllStadiums(page: number = 0, size: number = 10): Promise<ApiResponse<StadiumsPageResponse>> {
    return apiClient.get(`/api/v1/admin/stadiums?page=${page}&size=${size}`);
  }

  async createStadium(request: CreateStadiumRequest, teamId?: number): Promise<ApiResponse<AdminStadium>> {
    const url = teamId 
      ? `/api/v1/admin/stadiums?teamId=${teamId}`
      : '/api/v1/admin/stadiums';
    return apiClient.post(url, request);
  }

  async updateStadium(id: number, request: UpdateStadiumRequest): Promise<ApiResponse<AdminStadium>> {
    return apiClient.put(`/api/v1/admin/stadiums/${id}`, request);
  }

  async deleteStadium(id: number): Promise<ApiResponse<string>> {
    try {
      const response = await apiClient.delete<ApiResponse<string>>(`/api/v1/admin/stadiums/${id}`);
      return response;
    } catch (error) {
      console.error('API delete error:', error);
      throw error;
    }
  }

  async searchStadiumsByName(name: string): Promise<ApiResponse<AdminStadium[]>> {
    return apiClient.get(`/api/v1/admin/stadiums/search?name=${encodeURIComponent(name)}`);
  }
}

export const adminStadiumService = new AdminStadiumService();