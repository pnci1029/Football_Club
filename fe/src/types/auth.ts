export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  admin: AdminInfo;
}

export interface AdminInfo {
  id: number;
  username: string;
  role: string;
  email?: string;
  name?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuthContextType {
  admin: AdminInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

export interface TokenValidationResponse {
  valid: boolean;
  admin: AdminInfo | null;
}