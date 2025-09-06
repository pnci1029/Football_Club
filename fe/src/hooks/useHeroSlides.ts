import { useState, useEffect, useCallback } from 'react';
import { HeroSlide } from '../types/hero';
import { HeroService } from '../services/heroService';

export const useHeroSlides = (teamId: number, activeOnly: boolean = true) => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fetchSlides = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const response: any = activeOnly 
        ? await HeroService.getActiveSlides(teamId)
        : await HeroService.getAllSlides(teamId);
      
      const data = Array.isArray(response) ? response : response.data || [];
      setSlides(data.sort((a: any, b: any) => a.sortOrder - b.sortOrder));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '슬라이드를 불러오는데 실패했습니다.';
      setError(errorMessage);
      console.error('Hero slides fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [teamId, activeOnly]);

  const refetch = useCallback(() => {
    fetchSlides();
  }, [fetchSlides]);

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  return {
    slides,
    loading,
    error,
    refetch
  };
};