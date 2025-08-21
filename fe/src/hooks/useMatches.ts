import { useApi } from './useApi';
import { matchService } from '../services/matchService';
import { Match } from '../types/match';
import { PageResponse } from '../types/api';

export function useMatches(page: number = 0, size: number = 10, status?: string) {
  return useApi<PageResponse<Match>>(
    () => matchService.getMatches(page, size, status),
    [page, size, status]
  );
}

export function useMatch(id: number) {
  return useApi<Match>(
    () => matchService.getMatch(id),
    [id]
  );
}

export function useMatchesByTeam(teamId: number, page: number = 0, size: number = 10, status?: string) {
  return useApi<PageResponse<Match>>(
    () => matchService.getMatchesByTeam(teamId, page, size, status),
    [teamId, page, size, status]
  );
}

export function useUpcomingMatches(teamId: number) {
  return useApi<Match[]>(
    () => matchService.getUpcomingMatches(teamId),
    [teamId]
  );
}