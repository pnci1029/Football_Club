import { useApi } from './useApi';
import { stadiumService } from '../services/stadiumService';
import { StadiumDto } from '../types/stadium';
import { PageResponse } from '../types/api';

export function useStadiums(page: number = 0, size: number = 10) {
  return useApi<PageResponse<StadiumDto>>(
    () => stadiumService.getStadiums(page, size),
    [page, size]
  );
}

export function useStadium(id: number) {
  return useApi<StadiumDto>(
    () => stadiumService.getStadium(id),
    [id]
  );
}

export function useStadiumSearch(params: { name?: string; address?: string }) {
  return useApi<StadiumDto[]>(
    () => stadiumService.searchStadiums(params),
    [params.name, params.address],
    { immediate: false }
  );
}