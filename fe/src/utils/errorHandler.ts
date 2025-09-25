/**
 * API 에러 처리 유틸리티
 */

interface ApiError {
  code?: string;
  message?: string;
  details?: any;
  timestamp?: string;
}

interface ApiErrorResponse {
  success: boolean;
  data: null;
  message: string | null;
  error?: {
    code: string;
    message: string;
    details: any;
  };
  timestamp: string;
}

/**
 * API 에러에서 사용자 친화적인 메시지를 추출합니다.
 */
export function getErrorMessage(error: any): string {
  // Axios 에러 구조 확인
  if (error?.response?.data) {
    const errorData = error.response.data as ApiErrorResponse;
    
    // 백엔드 에러 응답 구조 - error.message에서 실제 메시지 추출
    if (errorData.error?.message) {
      const fullMessage = errorData.error.message;
      
      // "Invalid value 'password' for field 'permission': 비밀번호가 올바르지 않습니다." 
      // 형태에서 콜론 뒤의 실제 메시지만 추출
      const colonIndex = fullMessage.lastIndexOf(': ');
      if (colonIndex !== -1) {
        return fullMessage.substring(colonIndex + 2).trim();
      }
      
      return fullMessage;
    }
    
    // 일반적인 메시지
    if (errorData.message) {
      return errorData.message;
    }
    
    // 상태 코드별 기본 메시지
    const status = error.response?.status;
    switch (status) {
      case 400:
        return '잘못된 요청입니다. 입력 정보를 확인해주세요.';
      case 401:
        return '인증에 실패했습니다.';
      case 403:
        return '권한이 없습니다.';
      case 404:
        return '요청한 리소스를 찾을 수 없습니다.';
      case 500:
        return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      default:
        return `요청 실패 (${status})`;
    }
  }
  
  // API 클라이언트에서 처리된 에러
  if (error?.message && !error.message.includes('status code')) {
    return error.message;
  }
  
  // 네트워크 에러
  if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) {
    return '네트워크 연결을 확인해주세요.';
  }
  
  // 기본 메시지
  return '요청 처리 중 오류가 발생했습니다.';
}

/**
 * 비밀번호 관련 에러인지 확인합니다.
 */
export function isPasswordError(error: any): boolean {
  const message = getErrorMessage(error);
  return message.includes('비밀번호') || message.includes('password');
}

/**
 * 권한 관련 에러인지 확인합니다.
 */
export function isPermissionError(error: any): boolean {
  const errorCode = error?.response?.data?.error?.code || error?.code;
  return errorCode === 'INVALID_REQUEST' || errorCode === 'PERMISSION_DENIED';
}

/**
 * 에러 상황에 따른 사용자 행동 가이드를 제공합니다.
 */
export function getErrorActionGuide(error: any): string | null {
  const message = getErrorMessage(error);
  const status = error?.response?.status;

  if (isPasswordError(error)) {
    return '작성 시 입력한 비밀번호를 정확히 입력해주세요.';
  }

  if (status === 404) {
    return '게시글이 삭제되었거나 존재하지 않을 수 있습니다. 목록에서 다시 확인해주세요.';
  }

  if (status === 429) {
    return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
  }

  if (status >= 500) {
    return '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
  }

  return null;
}

/**
 * 에러 로깅 (개발/디버깅용)
 */
export function logError(error: any, context?: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🚨 Error${context ? ` in ${context}` : ''}`);
    console.error('Error object:', error);
    console.error('User message:', getErrorMessage(error));
    console.error('Stack trace:', error?.stack);
    console.groupEnd();
  }
}