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
  teamName: string;
  isActive: boolean;
  teamId?: number;
  [key: string]: unknown;
}

import { PlayerDto } from '../../player';