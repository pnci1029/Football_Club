import { Team } from '../types/team';
import { Teams } from '../api';
import { TeamPageResponse } from '../types/interfaces/team';

class TeamService {
  async getAllTeams(): Promise<Team[]> {
    try {
      const teamsResponse = await Teams.public.getAll();
      // 배열인지 PageResponse인지 확인
      const teamsArray = Array.isArray(teamsResponse) ? teamsResponse : (teamsResponse as TeamPageResponse).content || [];
      return teamsArray.map((team: any) => ({
        ...team,
        id: typeof team.id === 'number' ? team.id.toString() : team.id
      }));
    } catch (error) {
      console.error('팀 목록을 가져오는데 실패했습니다:', error);
      return [];
    }
  }

  async getTeamByCode(code: string): Promise<Team | null> {
    try {
      const response: any = await Teams.public.getByCode(code);
      
      // 응답 구조 확인 (래핑된 응답 처리)
      const team = response.data || response;
      
      if (!team || !team.id) {
        console.warn(`팀 코드 ${code}에 대한 데이터가 없거나 ID가 없습니다.`);
        return null;
      }
      
      return {
        ...team,
        id: typeof team.id === 'number' ? team.id.toString() : team.id
      };
    } catch (error) {
      console.error(`팀 코드 ${code}에 대한 정보를 가져오는데 실패했습니다:`, error);
      return null;
    }
  }

  async getTeamById(id: string): Promise<Team | null> {
    try {
      const team: Omit<Team, 'id'> & { id: number } = await Teams.public.getById(parseInt(id));
      return {
        ...team,
        id: typeof team.id === 'number' ? team.id.toString() : team.id
      };
    } catch (error) {
      console.error(`팀 ID ${id}에 대한 정보를 가져오는데 실패했습니다:`, error);
      return null;
    }
  }

}

export const teamService = new TeamService();