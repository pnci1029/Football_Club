import { PlayerDto } from '../types/player';
import { PageResponse } from '../types/api';
import { Players } from '../api';
import { PlayerApiResponse, PlayerTransformData } from '../types/interfaces/player';

export class PlayerService {
  async getPlayers(page: number = 0, size: number = 10): Promise<PageResponse<PlayerDto>> {
    try {
      console.log('플레이어 조회 시작:', { page, size });
      const response = await Players.public.getAll({ page, size }) as unknown as PlayerApiResponse;
      console.log('플레이어 API 응답:', response);
      
      // 서버 응답 구조: { success, data: { content: [...], page: {...} } }
      const actualData = response.success ? response.data : response;
      const content = (actualData as any).content || [];
      const pageInfo = (actualData as any).page || {};
      
      console.log('처리된 데이터:', { content, pageInfo });
      
      // 새로운 API 응답을 기존 타입으로 변환
      const legacyResponse: PageResponse<PlayerDto> = {
        content: content.map((player: PlayerTransformData) => ({
          ...player,
          // 서버에서 이미 teamName과 isActive를 제공하므로 그대로 사용
          teamName: player.teamName || (player.teamId ? `Team ${player.teamId}` : 'Unknown Team'),
          isActive: player.isActive !== undefined ? player.isActive : true
        })),
        pageable: {
          sort: { empty: true, sorted: false, unsorted: true },
          offset: page * size,
          pageSize: size,
          pageNumber: page,
          paged: true,
          unpaged: false
        },
        last: pageInfo.last !== undefined ? pageInfo.last : true,
        totalPages: pageInfo.totalPages || 1,
        totalElements: pageInfo.totalElements || content.length,
        size: pageInfo.size || size,
        number: pageInfo.number || page,
        sort: { empty: true, sorted: false, unsorted: true },
        first: pageInfo.first !== undefined ? pageInfo.first : true,
        numberOfElements: pageInfo.numberOfElements || content.length,
        empty: pageInfo.empty !== undefined ? pageInfo.empty : content.length === 0
      };
      return legacyResponse;
    } catch (error) {
      console.error('선수 목록을 불러오는데 실패했습니다:', error);
      throw new Error('선수 목록을 불러오는데 실패했습니다');
    }
  }

  async getPlayer(id: number): Promise<PlayerDto> {
    try {
      const player = await Players.public.getById(id);
      return {
        ...player,
        teamName: player.teamId ? `Team ${player.teamId}` : 'Unknown Team',
        isActive: true
      };
    } catch (error) {
      console.error(`선수 정보를 불러오는데 실패했습니다 (ID: ${id}):`, error);
      throw new Error('선수 정보를 불러오는데 실패했습니다');
    }
  }

  async getActivePlayers(): Promise<PlayerDto[]> {
    try {
      const players = await Players.public.getActive();
      return players.map(player => ({
        ...player,
        teamName: player.teamId ? `Team ${player.teamId}` : 'Unknown Team',
        isActive: true
      }));
    } catch (error) {
      console.error('활성 선수 목록을 불러오는데 실패했습니다:', error);
      throw new Error('활성 선수 목록을 불러오는데 실패했습니다');
    }
  }

  // 새로운 편의 메서드들
  async searchPlayersByName(name: string, teamId?: number): Promise<PlayerDto[]> {
    try {
      const players = await Players.searchByName(name, teamId);
      return players.map(player => ({
        ...player,
        teamName: player.teamId ? `Team ${player.teamId}` : 'Unknown Team',
        isActive: true
      }));
    } catch (error) {
      console.error(`선수 검색에 실패했습니다 (이름: ${name}):`, error);
      return [];
    }
  }

  async getPlayersByPosition(position: string, teamId?: number): Promise<PlayerDto[]> {
    try {
      const players = await Players.getByPosition(position, teamId);
      return players.map(player => ({
        ...player,
        teamName: player.teamId ? `Team ${player.teamId}` : 'Unknown Team',
        isActive: true
      }));
    } catch (error) {
      console.error(`포지션별 선수 조회에 실패했습니다 (포지션: ${position}):`, error);
      return [];
    }
  }
}

export const playerService = new PlayerService();