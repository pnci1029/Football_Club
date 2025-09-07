import { Team } from '../types/team';
import { apiClient } from './api';

class TeamService {
  async getAllTeams(): Promise<Team[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: Team[] }>('/api/v1/teams');
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('팀 목록을 가져오는데 실패했습니다:', error);
      return [];
    }
  }

  async getTeamByCode(code: string): Promise<Team | null> {
    try {
      const response = await apiClient.get<{ success: boolean; data: Team }>(`/api/v1/teams/code/${code}`);
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error(`팀 코드 ${code}에 대한 정보를 가져오는데 실패했습니다:`, error);
      return null;
    }
  }

  async getTeamById(id: string): Promise<Team | null> {
    try {
      const response = await apiClient.get<{ success: boolean; data: Team }>(`/api/v1/teams/${id}`);
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error(`팀 ID ${id}에 대한 정보를 가져오는데 실패했습니다:`, error);
      return null;
    }
  }
}

export const teamService = new TeamService();