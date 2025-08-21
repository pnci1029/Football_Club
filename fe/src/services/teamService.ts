import { Team } from '../types/team';
import { apiClient } from './api';

class TeamService {
  async getAllTeams(): Promise<Team[]> {
    const response = await apiClient.get<{ success: boolean; data: Team[] }>('/api/v1/teams');
    return response.data;
  }

  async getTeamByCode(code: string): Promise<Team> {
    const response = await apiClient.get<{ success: boolean; data: Team }>(`/api/v1/teams/code/${code}`);
    return response.data;
  }

  async getTeamById(id: string): Promise<Team> {
    const response = await apiClient.get<{ success: boolean; data: Team }>(`/api/v1/teams/${id}`);
    return response.data;
  }
}

export const teamService = new TeamService();