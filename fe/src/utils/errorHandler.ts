/**
 * API 에러 처리 유틸리티
 */



export interface NetworkError {
  code?: string;
  message?: string;
  details?: {
    error?: {
      code?: string;
      message?: string;
    };
  };
  response?: {
    status?: number;
    data?: {
      error?: {
        code?: string;
        message?: string;
      };
      message?: string;
    };
  };
  stack?: string;
}

/**
 * API 에러에서 사용자 친화적인 메시지를 추출합니다.
 */
export function getErrorMessage(error: NetworkError, defaultMessage?: string): string {
  // API 클라이언트에서 처리된 에러 구조 확인 (error.details)
  if (error?.details?.error?.message) {
    const fullMessage = error.details.error.message;
    
    // "Invalid value 'content' for field 'profanity': 제목에 부적절한 표현이 포함되어 있습니다." 
    // 형태에서 콜론 뒤의 실제 메시지만 추출
    const colonIndex = fullMessage.lastIndexOf(': ');
    if (colonIndex !== -1) {
      const extractedMessage = fullMessage.substring(colonIndex + 2).trim();
      return extractedMessage;
    }
    
    return fullMessage;
  }

  // Axios 에러 구조 확인 (error.response.data)
  if (error?.response?.data) {
    const errorData = error.response.data;
    
    // 백엔드 에러 응답 구조 - error.message에서 실제 메시지 추출
    if (errorData.error?.message) {
      const fullMessage = errorData.error.message;
      
      // "Invalid value 'content' for field 'profanity': 제목에 부적절한 표현이 포함되어 있습니다." 
      // 형태에서 콜론 뒤의 실제 메시지만 추출
      const colonIndex = fullMessage.lastIndexOf(': ');
      if (colonIndex !== -1) {
        const extractedMessage = fullMessage.substring(colonIndex + 2).trim();
        return extractedMessage;
      }
      
      return fullMessage;
    }
    
    // 백엔드 RuntimeException 처리
    if (errorData.message && typeof errorData.message === 'string') {
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
  
  // 기본 메시지 (defaultMessage가 제공되면 사용, 아니면 기본값 사용)
  return defaultMessage || '요청 처리 중 오류가 발생했습니다.';
}

/**
 * 비밀번호 관련 에러인지 확인합니다.
 */
export function isPasswordError(error: NetworkError): boolean {
  const message = getErrorMessage(error);
  return message.includes('비밀번호') || message.includes('password');
}

/**
 * 권한 관련 에러인지 확인합니다.
 */
export function isPermissionError(error: NetworkError): boolean {
  const errorCode = error?.response?.data?.error?.code || error?.code;
  return errorCode === 'INVALID_REQUEST' || errorCode === 'PERMISSION_DENIED';
}

/**
 * 비속어 필터 관련 에러인지 확인합니다.
 */
export function isProfanityError(error: NetworkError): boolean {
  const errorCode = error?.response?.data?.error?.code || error?.code;
  return !!(errorCode === 'PROFANITY_IN_TITLE' || 
         errorCode === 'PROFANITY_IN_CONTENT' || 
         errorCode === 'PROFANITY_IN_COMMENT' ||
         errorCode === 'PROFANITY_DETECTED' ||
         (errorCode === 'INVALID_REQUEST' && 
          error?.response?.data?.error?.message?.includes('부적절한 표현')));
}

/**
 * 에러 상황에 따른 사용자 행동 가이드를 제공합니다.
 */
export function getErrorActionGuide(error: NetworkError): string | null {
  const status = error?.response?.status;

  if (isProfanityError(error)) {
    return '부적절한 표현을 수정한 후 다시 작성해주세요.';
  }

  if (isPasswordError(error)) {
    return '작성 시 입력한 비밀번호를 정확히 입력해주세요.';
  }

  if (status === 404) {
    return '게시글이 삭제되었거나 존재하지 않을 수 있습니다. 목록에서 다시 확인해주세요.';
  }

  if (status === 429) {
    return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
  }

  if (status && status >= 500) {
    return '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
  }

  return null;
}

/**
 * 에러 로깅 (개발/디버깅용)
 */
export function logError(error: NetworkError, context?: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🚨 Error${context ? ` in ${context}` : ''}`);
    console.error('Error object:', error);
    console.error('User message:', getErrorMessage(error));
    console.error('Stack trace:', error?.stack);
    console.groupEnd();
  }
}