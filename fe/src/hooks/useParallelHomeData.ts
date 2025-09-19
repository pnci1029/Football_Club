import { PlayerDto } from '../types/player';
import { HeroSlide } from '../types/hero';
import { usePlayers } from './usePlayers';
import { useHeroSlides } from './useHeroSlides';

interface ParallelHomeData {
  players: PlayerDto[];
  heroSlides: HeroSlide[];
  isLoading: boolean;
  playersLoading: boolean;
  heroSlidesLoading: boolean;
}

export const useParallelHomeData = (teamId: number | null): ParallelHomeData => {
  const playersHook = usePlayers(0, 12);
  const heroSlidesHook = useHeroSlides(teamId || -1, true);
  
  const players = playersHook.data?.content || [];
  const heroSlides = heroSlidesHook.slides || [];
  const playersLoading = playersHook.loading;
  const heroSlidesLoading = heroSlidesHook.loading;
  const isLoading = playersLoading || heroSlidesLoading;


  return {
    players,
    heroSlides,
    isLoading,
    playersLoading,
    heroSlidesLoading,
  };
};