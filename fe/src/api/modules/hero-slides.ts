/**
 * Hero Slides API 모듈 - 메인 슬라이드 관련 API
 */

import { api } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import {
  HeroSlide,
  CreateHeroSlideRequest,
  UpdateHeroSlideRequest,
  ApiResponse,
  PageResponse,
  PageParams,
} from '../types';

// Public Hero Slides API
export const heroSlidesApi = {
  // 활성 슬라이드들 조회
  getActive: (): Promise<HeroSlide[]> =>
    api.callEndpoint<HeroSlide[]>(API_ENDPOINTS.HERO_SLIDES.ACTIVE),
};

// Admin Hero Slides API
export const adminHeroSlidesApi = {
  // 슬라이드 목록 조회 (페이징)
  getAll: (params?: PageParams): Promise<ApiResponse<PageResponse<HeroSlide>>> =>
    api.callEndpoint<ApiResponse<PageResponse<HeroSlide>>>(
      API_ENDPOINTS.ADMIN_HERO_SLIDES.LIST,
      undefined,
      undefined,
      params
    ),

  // ID로 슬라이드 조회
  getById: (id: number): Promise<ApiResponse<HeroSlide>> =>
    api.callEndpoint<ApiResponse<HeroSlide>>(API_ENDPOINTS.ADMIN_HERO_SLIDES.GET, { id }),

  // 슬라이드 생성
  create: (data: CreateHeroSlideRequest): Promise<ApiResponse<HeroSlide>> =>
    api.callEndpoint<ApiResponse<HeroSlide>>(API_ENDPOINTS.ADMIN_HERO_SLIDES.CREATE, undefined, data),

  // 슬라이드 수정
  update: (id: number, data: UpdateHeroSlideRequest): Promise<ApiResponse<HeroSlide>> =>
    api.callEndpoint<ApiResponse<HeroSlide>>(API_ENDPOINTS.ADMIN_HERO_SLIDES.UPDATE, { id }, data),

  // 슬라이드 삭제
  delete: (id: number): Promise<ApiResponse<string>> =>
    api.callEndpoint<ApiResponse<string>>(API_ENDPOINTS.ADMIN_HERO_SLIDES.DELETE, { id }),

  // 슬라이드 순서 변경
  updateOrder: (id: number, order: number): Promise<ApiResponse<HeroSlide>> =>
    api.callEndpoint<ApiResponse<HeroSlide>>(
      API_ENDPOINTS.ADMIN_HERO_SLIDES.UPDATE_ORDER,
      { id },
      { order }
    ),

  // 슬라이드 활성화/비활성화
  updateActive: (id: number, active: boolean): Promise<ApiResponse<HeroSlide>> =>
    api.callEndpoint<ApiResponse<HeroSlide>>(
      API_ENDPOINTS.ADMIN_HERO_SLIDES.UPDATE_ACTIVE,
      { id },
      { active }
    ),
};

// 통합 Hero Slides API
export const HeroSlides = {
  // Public API
  public: heroSlidesApi,

  // Admin API
  admin: adminHeroSlidesApi,

  // 편의 메서드들
  async getActiveSlides(): Promise<HeroSlide[]> {
    return await heroSlidesApi.getActive();
  },

  // CRUD 헬퍼 (Admin)
  async createSlide(data: CreateHeroSlideRequest): Promise<HeroSlide> {
    const response = await adminHeroSlidesApi.create(data);
    return response.data;
  },

  async updateSlide(id: number, data: UpdateHeroSlideRequest): Promise<HeroSlide> {
    const response = await adminHeroSlidesApi.update(id, data);
    return response.data;
  },

  async deleteSlide(id: number): Promise<void> {
    await adminHeroSlidesApi.delete(id);
  },

  async reorderSlide(id: number, newOrder: number): Promise<HeroSlide> {
    const response = await adminHeroSlidesApi.updateOrder(id, newOrder);
    return response.data;
  },

  async toggleSlideActive(id: number, active: boolean): Promise<HeroSlide> {
    const response = await adminHeroSlidesApi.updateActive(id, active);
    return response.data;
  },

  // 슬라이드 정렬 및 관리
  async getAllSlidesOrdered(): Promise<HeroSlide[]> {
    const response = await adminHeroSlidesApi.getAll();
    return response.data.content.sort((a, b) => (a.order || 0) - (b.order || 0));
  },

  async getNextOrder(): Promise<number> {
    const slides = await this.getAllSlidesOrdered();
    const maxOrder = Math.max(...slides.map(slide => slide.order || 0), 0);
    return maxOrder + 1;
  },
};

export default HeroSlides;