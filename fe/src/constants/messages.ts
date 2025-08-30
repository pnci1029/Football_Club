/**
 * 메시지 관련 상수 정의
 */

/**
 * 성공 메시지
 */
export const SUCCESS_MESSAGES = {
  CREATE: '생성되었습니다.',
  UPDATE: '수정되었습니다.',
  DELETE: '삭제되었습니다.',
  SAVE: '저장되었습니다.',
  LOGIN: '로그인되었습니다.',
  LOGOUT: '로그아웃되었습니다.',
  UPLOAD: '업로드되었습니다.',
} as const;

/**
 * 에러 메시지
 */
export const ERROR_MESSAGES = {
  CREATE_FAILED: '생성에 실패했습니다.',
  UPDATE_FAILED: '수정에 실패했습니다.',
  DELETE_FAILED: '삭제에 실패했습니다.',
  SAVE_FAILED: '저장에 실패했습니다.',
  LOGIN_FAILED: '로그인에 실패했습니다.',
  LOGOUT_FAILED: '로그아웃에 실패했습니다.',
  LOAD_FAILED: '로딩에 실패했습니다.',
  UPLOAD_FAILED: '업로드에 실패했습니다.',
  NETWORK_ERROR: '네트워크 오류가 발생했습니다.',
  AUTH_ERROR: '인증에 실패했습니다.',
  PERMISSION_DENIED: '권한이 없습니다.',
  NOT_FOUND: '요청한 데이터를 찾을 수 없습니다.',
  VALIDATION_ERROR: '입력값을 확인해주세요.',
  TOKEN_EXPIRED: '로그인이 만료되었습니다.',
  SERVER_ERROR: '서버 오류가 발생했습니다.',
} as const;

/**
 * 로딩 메시지
 */
export const LOADING_MESSAGES = {
  CREATING: '생성 중...',
  UPDATING: '수정 중...',
  DELETING: '삭제 중...',
  SAVING: '저장 중...',
  LOADING: '로딩 중...',
  LOGGING_IN: '로그인 중...',
  UPLOADING: '업로드 중...',
  PROCESSING: '처리 중...',
} as const;

/**
 * 확인 메시지
 */
export const CONFIRM_MESSAGES = {
  DELETE: '정말로 삭제하시겠습니까?',
  LOGOUT: '로그아웃 하시겠습니까?',
  CANCEL: '작업을 취소하시겠습니까?',
  DISCARD_CHANGES: '변경사항을 취소하시겠습니까?',
  PERMANENT_DELETE: '이 작업은 되돌릴 수 없습니다. 계속하시겠습니까?',
} as const;