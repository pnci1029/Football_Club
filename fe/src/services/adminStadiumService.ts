import { apiClient } from './api';

export interface AdminStadium {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  teamId: number;
  teamName: string;
  facilities?: string[];
  hourlyRate?: number;
  availableHours?: string;
  availableDays?: string[];
  contactNumber?: string;
  imageUrls?: string[];
}

export interface CreateStadiumRequest {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  teamId?: number;
  facilities: string[];
  hourlyRate: number;
  availableHours: string;
  availableDays: string[];
  contactNumber: string;
  imageUrls: string[];
}

export interface UpdateStadiumRequest {
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  facilities?: string[];
  hourlyRate?: number;
  availableHours?: string;
  availableDays?: string[];
  contactNumber?: string;
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
  async getAllStadiums(page: number = 0, size: number = 10, teamId: number): Promise<ApiResponse<StadiumsPageResponse>> {
    const url = `/api/v1/admin/stadiums?page=${page}&size=${size}&teamId=${teamId}`;
    return apiClient.get(url);
  }

  async createStadium(request: CreateStadiumRequest, teamId?: number): Promise<ApiResponse<AdminStadium>> {
    const finalRequest = teamId ? { ...request, teamId } : request;
    return apiClient.post('/api/v1/admin/stadiums', finalRequest);
  }

  async updateStadium(id: number, request: UpdateStadiumRequest): Promise<ApiResponse<AdminStadium>> {
    return apiClient.put(`/api/v1/admin/stadiums/${id}`, request);
  }

  async deleteStadium(id: number): Promise<ApiResponse<string>> {
    return apiClient.delete(`/api/v1/admin/stadiums/${id}`);
  }
}

export const adminStadiumService = new AdminStadiumService();