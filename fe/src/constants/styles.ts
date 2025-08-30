/**
 * 공통 스타일 클래스 상수 정의
 */

/**
 * 폼 입력 요소 스타일
 */
export const FORM_STYLES = {
  INPUT: 'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
  SELECT: 'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
  TEXTAREA: 'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none',
  LABEL: 'block text-sm font-medium text-gray-700 mb-1',
  ERROR_INPUT: 'w-full px-3 py-2 border border-red-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500',
} as const;

/**
 * 버튼 스타일
 */
export const BUTTON_STYLES = {
  PRIMARY: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200',
  SECONDARY: 'bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors duration-200',
  DANGER: 'bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200',
  SUCCESS: 'bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200',
  DISABLED: 'bg-gray-400 text-white font-medium py-2 px-4 rounded-md cursor-not-allowed',
  LINK: 'text-blue-600 hover:text-blue-800 underline transition-colors duration-200',
} as const;

/**
 * 알림 메시지 스타일
 */
export const ALERT_STYLES = {
  SUCCESS: 'bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded',
  ERROR: 'bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded',
  WARNING: 'bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded',
  INFO: 'bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded',
} as const;

/**
 * 카드/컨테이너 스타일
 */
export const CONTAINER_STYLES = {
  CARD: 'bg-white rounded-lg shadow-md p-6',
  MODAL: 'bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-auto',
  MODAL_OVERLAY: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50',
  SECTION: 'bg-white rounded-lg shadow p-6 mb-6',
} as const;

/**
 * 레이아웃 스타일
 */
export const LAYOUT_STYLES = {
  CENTER: 'flex items-center justify-center',
  FLEX_BETWEEN: 'flex items-center justify-between',
  FLEX_START: 'flex items-center justify-start',
  FLEX_END: 'flex items-center justify-end',
  GRID_COLS_2: 'grid grid-cols-1 md:grid-cols-2 gap-4',
  GRID_COLS_3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
  GRID_COLS_4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',
} as const;

/**
 * 텍스트 스타일
 */
export const TEXT_STYLES = {
  HEADING_1: 'text-3xl font-bold text-gray-900',
  HEADING_2: 'text-2xl font-bold text-gray-900',
  HEADING_3: 'text-xl font-semibold text-gray-900',
  SUBTITLE: 'text-lg text-gray-600',
  BODY: 'text-gray-700',
  CAPTION: 'text-sm text-gray-500',
  ERROR: 'text-sm text-red-600',
  SUCCESS: 'text-sm text-green-600',
} as const;