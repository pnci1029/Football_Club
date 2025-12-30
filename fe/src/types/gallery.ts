export enum GalleryCategory {
  MATCH = 'MATCH',
  TRAINING = 'TRAINING', 
  EVENT = 'EVENT',
  PLAYER = 'PLAYER',
  FACILITY = 'FACILITY',
  ACHIEVEMENT = 'ACHIEVEMENT',
  HIGHLIGHT = 'HIGHLIGHT',
  ETC = 'ETC'
}

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO'
}

export enum PlayType {
  GOAL = 'GOAL',
  ASSIST = 'ASSIST',
  SAVE = 'SAVE',
  TACKLE = 'TACKLE',
  SKILL = 'SKILL',
  TEAM_PLAY = 'TEAM_PLAY',
  CARD = 'CARD',
  CELEBRATION = 'CELEBRATION',
  FOUL = 'FOUL',
  FREE_KICK = 'FREE_KICK',
  CORNER_KICK = 'CORNER_KICK',
  PENALTY = 'PENALTY',
  OTHER = 'OTHER'
}

export interface GalleryMediaDto {
  id: number;
  fileName: string;
  originalFileName: string;
  fileUrl: string;
  thumbnailUrl?: string;
  fileSize: number;
  fileSizeFormatted: string;
  mediaType: MediaType;
  width?: number;
  height?: number;
  duration?: number;
  durationFormatted?: string;
  isCover: boolean;
  sortOrder: number;
  uploadedAt: string;
}

// 백워드 호환성을 위한 별칭
export type GalleryMedia = GalleryMediaDto;

export interface HighlightMetadataDto {
  id: number;
  matchId?: number;
  playType: PlayType;
  playTypeDisplayName: string;
  playerNames?: string;
  gameMinute?: number;
  gameMinuteFormatted?: string;
  description?: string;
  highlightRating: number;
}

// 백워드 호환성을 위한 별칭
export type HighlightMetadata = HighlightMetadataDto;

export interface GalleryTag {
  id: number;
  tagName: string;
  color?: string;
}

export interface GalleryDto {
  id: number;
  title: string;
  description?: string;
  category: GalleryCategory;
  categoryDisplayName: string;
  coverImageUrl?: string;
  mediaCount: number;
  imageCount: number;
  videoCount: number;
  viewCount: number;
  isFeatured: boolean;
  createdBy?: string;
  createdAt: string;
  tags: string[];
}

export interface GalleryDetailDto {
  id: number;
  title: string;
  description?: string;
  category: GalleryCategory;
  categoryDisplayName: string;
  viewCount: number;
  isFeatured: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  mediaFiles: GalleryMediaDto[];
  tags: string[];
  highlightMetadata?: HighlightMetadataDto;
}

// 백워드 호환성을 위한 별칭
export type Gallery = GalleryDto;

export interface GalleryListParams {
  page?: number;
  size?: number;
  keyword?: string;
  category?: GalleryCategory;
  tags?: string[];
  startDate?: string;
  endDate?: string;
}

export interface GalleryResponse {
  content: Gallery[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface CreateGalleryRequest {
  title: string;
  description?: string;
  category: GalleryCategory;
  tags?: string[];
  highlightMetadata?: {
    playType: PlayType;
    playerNames?: string;
    gameMinute?: number;
    highlightRating: number;
    description?: string;
  };
}

export interface UpdateGalleryRequest {
  title?: string;
  description?: string;
  category?: GalleryCategory;
  tags?: string[];
  highlightMetadata?: {
    playType: PlayType;
    playerNames?: string;
    gameMinute?: number;
    highlightRating: number;
    description?: string;
  };
}

export interface GalleryStatistics {
  totalGalleryCount: number;
  categoryStats: Record<GalleryCategory, number>;
  totalViewCount: number;
  totalMediaCount: number;
  thisMonthGalleryCount: number;
}

export interface PopularGalleryResponse {
  galleries: Gallery[];
}