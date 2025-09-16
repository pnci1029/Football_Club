export interface HeroSlide {
  id: number;
  teamId: number;
  title: string;
  subtitle?: string;
  content?: string;
  imageUrl: string;
  linkUrl?: string;
  order: number;
  sortOrder: number;
  active: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateHeroSlideRequest {
  title: string;
  subtitle?: string;
  content?: string;
  imageUrl: string;
  linkUrl?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface UpdateHeroSlideRequest {
  title?: string;
  subtitle?: string;
  content?: string;
  imageUrl?: string;
  linkUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface HeroSlideApiResponse {
  success: boolean;
  data: HeroSlide | HeroSlide[];
  message?: string;
  error?: string;
}

export interface HeroSlidePageResponse {
  content: HeroSlide[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface HeroSlideSearchParams {
  teamId: number;
  activeOnly?: boolean;
  page?: number;
  size?: number;
}

export interface HeroSlidesHookReturn {
  slides: HeroSlide[];
  loading: boolean;
  error: string;
  refetch: () => void;
}