import { useApi } from './useApi';
import { playerService } from '../services/playerService';
import { PlayerDto } from '../types/player';
import { PageResponse } from '../types/api';

export function usePlayers(page: number = 0, size: number = 10) {
  return useApi<PageResponse<PlayerDto>>(
    () => playerService.getPlayers(page, size),
    [page, size]
  );
}

export function usePlayer(id: number) {
  return useApi<PlayerDto>(
    () => playerService.getPlayer(id),
    [id]
  );
}

export function useActivePlayers() {
  return useApi<PlayerDto[]>(
    () => playerService.getActivePlayers(),
    []
  );
}