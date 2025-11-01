import { apiClient } from './api';
import { AdminBasicInfo, CreateAdminRequest, ApiResponse } from '../types/api';

const API_URL = '/api/v1/admin/management';

export const adminManagementService = {
  getAdminsByTeam: async (teamId: number): Promise<AdminBasicInfo[]> => {
    const response = await apiClient.get<ApiResponse<AdminBasicInfo[]>>(`${API_URL}/admins?teamId=${teamId}`);
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to fetch admins');
    }
  },

  createAdmin: async (request: CreateAdminRequest): Promise<AdminBasicInfo> => {
    const response = await apiClient.post<ApiResponse<AdminBasicInfo>>(`${API_URL}/admins`, request);
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to create admin');
    }
  },

  deleteAdmin: async (adminId: number): Promise<void> => {
    const response = await apiClient.delete<ApiResponse<void>>(`${API_URL}/admins/${adminId}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete admin');
    }
  },
};
