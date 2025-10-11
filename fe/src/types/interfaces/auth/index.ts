import { AdminLevel } from '../../enums';

export interface AdminInfo {
  id: string;
  name: string;
  email: string;
  role: string;
  adminLevel?: AdminLevel;
  teamSubdomain?: string;
  permissions?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LoginUserResponse {
  accessToken: string;
  refreshToken?: string;
  admin: AdminInfo;
}

export interface AuthError {
  response?: {
    status: number;
    data?: {
      message?: string;
      error?: string;
      details?: Record<string, unknown>;
    };
  };
  message: string;
  code?: string;
}