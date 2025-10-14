export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, unknown>;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
  errors?: ValidationError[];
  code?: string;
  timestamp?: string;
}

export interface NetworkError extends Error {
  status?: number;
  response?: {
    data?: ErrorResponse;
    status?: number;
    statusText?: string;
  };
}

// Utility type for handling unknown errors
export type UnknownError = {
  message?: string;
  response?: {
    data?: {
      message?: string;
    };
  };
} | Error | ApiError | NetworkError | unknown;