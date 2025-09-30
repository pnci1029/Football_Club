export interface PlayerApiResponse {
  success: boolean;
  data: {
    content: PlayerDto[];
    page: {
      last: boolean;
      totalPages: number;
      totalElements: number;
      size: number;
      number: number;
      first: boolean;
      numberOfElements: number;
      empty: boolean;
    };
  };
}

export interface PlayerTransformData {
  id: number;
  name: string;
  position: string;
  backNumber: number;
  teamName: string;
  isActive: boolean;
  teamId?: number;
  profileImageUrl?: string;
  [key: string]: unknown;
}

import { PlayerDto } from '../../player';