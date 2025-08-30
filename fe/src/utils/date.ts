/**
 * 날짜 관련 유틸리티 함수
 */

/**
 * 날짜 포맷팅 유틸리티
 */
export class DateUtil {
  /**
   * 날짜를 YYYY-MM-DD 형식으로 포맷
   */
  static formatDate(date: Date | string): string {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return '';
    }

    return d.toISOString().split('T')[0];
  }

  /**
   * 날짜를 YYYY-MM-DD HH:MM 형식으로 포맷
   */
  static formatDateTime(date: Date | string): string {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return '';
    }

    return d.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  /**
   * 날짜를 한국어 형식으로 포맷 (2024년 1월 1일)
   */
  static formatKoreanDate(date: Date | string): string {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return '';
    }

    return d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * 시간을 HH:MM 형식으로 포맷
   */
  static formatTime(date: Date | string): string {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return '';
    }

    return d.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  /**
   * 상대 시간 표시 (몇 분 전, 몇 시간 전 등)
   */
  static formatRelativeTime(date: Date | string): string {
    const d = new Date(date);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return '방금 전';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}시간 전`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays}일 전`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths}개월 전`;
    }

    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears}년 전`;
  }

  /**
   * 두 날짜 사이의 일수 계산
   */
  static getDaysBetween(startDate: Date | string, endDate: Date | string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const diffInTime = end.getTime() - start.getTime();
    return Math.ceil(diffInTime / (1000 * 60 * 60 * 24));
  }

  /**
   * 날짜가 오늘인지 확인
   */
  static isToday(date: Date | string): boolean {
    const d = new Date(date);
    const today = new Date();
    
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear();
  }

  /**
   * 날짜가 과거인지 확인
   */
  static isPast(date: Date | string): boolean {
    const d = new Date(date);
    const now = new Date();
    
    return d.getTime() < now.getTime();
  }

  /**
   * 날짜가 미래인지 확인
   */
  static isFuture(date: Date | string): boolean {
    const d = new Date(date);
    const now = new Date();
    
    return d.getTime() > now.getTime();
  }

  /**
   * 날짜 범위 내에 있는지 확인
   */
  static isInRange(date: Date | string, startDate: Date | string, endDate: Date | string): boolean {
    const d = new Date(date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return d.getTime() >= start.getTime() && d.getTime() <= end.getTime();
  }

  /**
   * 월의 첫 번째 날 구하기
   */
  static getFirstDayOfMonth(date: Date | string): Date {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }

  /**
   * 월의 마지막 날 구하기
   */
  static getLastDayOfMonth(date: Date | string): Date {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth() + 1, 0);
  }

  /**
   * 날짜에 일수 추가
   */
  static addDays(date: Date | string, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  /**
   * 날짜에 월수 추가
   */
  static addMonths(date: Date | string, months: number): Date {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
  }

  /**
   * 날짜에 연수 추가
   */
  static addYears(date: Date | string, years: number): Date {
    const d = new Date(date);
    d.setFullYear(d.getFullYear() + years);
    return d;
  }

  /**
   * ISO 문자열을 로컬 날짜 입력값으로 변환 (datetime-local input용)
   */
  static toDateTimeLocalString(date: Date | string): string {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return '';
    }

    // 로컬 시간대로 조정
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - (offset * 60 * 1000));
    
    return localDate.toISOString().slice(0, 16);
  }

  /**
   * 나이 계산
   */
  static calculateAge(birthDate: Date | string): number {
    const birth = new Date(birthDate);
    const now = new Date();
    
    let age = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    
    return Math.max(0, age);
  }

  /**
   * 요일을 한국어로 반환
   */
  static getKoreanDayOfWeek(date: Date | string): string {
    const d = new Date(date);
    const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    return days[d.getDay()];
  }

  /**
   * 날짜 유효성 검증
   */
  static isValidDate(date: any): boolean {
    const d = new Date(date);
    return d instanceof Date && !isNaN(d.getTime());
  }
}