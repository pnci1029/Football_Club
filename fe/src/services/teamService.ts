import { Team } from '../types/team';
import { Teams } from '../api';

class TeamService {
  async getAllTeams(): Promise<Team[]> {
    try {
      const teamsResponse = await Teams.public.getAll();
      // 배열인지 PageResponse인지 확인
      const teamsArray = Array.isArray(teamsResponse) ? teamsResponse : (teamsResponse as any).content || [];
      return teamsArray.map((team: any) => ({
        ...team,
        id: team.id.toString()
      }));
    } catch (error) {
      console.error('팀 목록을 가져오는데 실패했습니다:', error);
      return [];
    }
  }

  async getTeamByCode(code: string): Promise<Team | null> {
    try {
      const team = await Teams.public.getByCode(code);
      return {
        ...team,
        id: team.id.toString()
      };
    } catch (error) {
      console.error(`팀 코드 ${code}에 대한 정보를 가져오는데 실패했습니다:`, error);
      return null;
    }
  }

  async getTeamById(id: string): Promise<Team | null> {
    try {
      const team = await Teams.public.getById(parseInt(id));
      return {
        ...team,
        id: team.id.toString()
      };
    } catch (error) {
      console.error(`팀 ID ${id}에 대한 정보를 가져오는데 실패했습니다:`, error);
      return null;
    }
  }

  // 새로운 편의 메서드들 (기존 API에서는 제공되지 않았음)
  async searchTeams(query: string): Promise<Team[]> {
    try {
      const teams = await Teams.search(query);
      return teams.map((team: any) => ({
        ...team,
        id: team.id.toString()
      }));
    } catch (error) {
      console.error(`팀 검색에 실패했습니다 (검색어: ${query}):`, error);
      return [];
    }
  }

  async teamExists(code: string): Promise<boolean> {
    try {
      return await Teams.exists(code);
    } catch (error) {
      console.error(`팀 존재 여부 확인에 실패했습니다 (코드: ${code}):`, error);
      return false;
    }
  }
}

export const teamService = new TeamService();