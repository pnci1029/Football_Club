import { useState, useEffect, useCallback } from 'react';
import { HeroService } from '../services/heroService';
import { HeroSlide } from '../types/hero';
import { ApiResponse } from '../api/types';

interface HeroSlidesHookReturn {
  slides: HeroSlide[];
  loading: boolean;
  error: string;
  refetch: () => void;
}

export const useHeroSlides = (teamId: number, activeOnly: boolean = true): HeroSlidesHookReturn => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fetchSlides = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const response: ApiResponse<HeroSlide[]> | HeroSlide[] = activeOnly 
        ? await HeroService.getActiveSlides(teamId)
        : await HeroService.getAllSlides(teamId);
      
      // 응답 구조 확인 (래핑된 응답 처리)
      const slidesData = 'data' in response ? response.data : response;
      
      // 배열인지 확인하고 정렬
      if (Array.isArray(slidesData)) {
        setSlides(slidesData.sort((a: HeroSlide, b: HeroSlide) => a.sortOrder - b.sortOrder));
      } else {
        console.warn('Hero slides response is not an array:', slidesData);
        setSlides([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '슬라이드를 불러오는데 실패했습니다.';
      setError(errorMessage);
      console.error('Hero slides fetch error:', err);
      setSlides([]);
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