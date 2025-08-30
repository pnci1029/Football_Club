/**
 * 로깅 유틸리티
 */

/**
 * 로그 레벨 정의
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * 로거 설정
 */
interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
}

/**
 * 로거 클래스
 */
export class Logger {
  private static config: LoggerConfig = {
    level: process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.DEBUG,
    enableConsole: true,
    enableRemote: false,
  };

  /**
   * 로거 설정 업데이트
   */
  static configure(config: Partial<LoggerConfig>): void {
    Logger.config = { ...Logger.config, ...config };
  }

  /**
   * 로그 출력 여부 확인
   */
  private static shouldLog(level: LogLevel): boolean {
    return level >= Logger.config.level;
  }

  /**
   * 콘솔 로그 출력
   */
  private static logToConsole(level: LogLevel, message: string, data?: any): void {
    if (!Logger.config.enableConsole) return;

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${LogLevel[level]}]`;

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(prefix, message, data);
        break;
      case LogLevel.INFO:
        console.info(prefix, message, data);
        break;
      case LogLevel.WARN:
        console.warn(prefix, message, data);
        break;
      case LogLevel.ERROR:
        console.error(prefix, message, data);
        break;
    }
  }

  /**
   * 원격 로그 전송 (필요시 구현)
   */
  private static async logToRemote(level: LogLevel, message: string, data?: any): Promise<void> {
    if (!Logger.config.enableRemote || !Logger.config.remoteEndpoint) return;

    try {
      await fetch(Logger.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          level: LogLevel[level],
          message,
          data,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      });
    } catch (error) {
      console.error('Failed to send remote log:', error);
    }
  }

  /**
   * 디버그 로그
   */
  static debug(message: string, data?: any): void {
    if (Logger.shouldLog(LogLevel.DEBUG)) {
      Logger.logToConsole(LogLevel.DEBUG, message, data);
      Logger.logToRemote(LogLevel.DEBUG, message, data);
    }
  }

  /**
   * 정보 로그
   */
  static info(message: string, data?: any): void {
    if (Logger.shouldLog(LogLevel.INFO)) {
      Logger.logToConsole(LogLevel.INFO, message, data);
      Logger.logToRemote(LogLevel.INFO, message, data);
    }
  }

  /**
   * 경고 로그
   */
  static warn(message: string, data?: any): void {
    if (Logger.shouldLog(LogLevel.WARN)) {
      Logger.logToConsole(LogLevel.WARN, message, data);
      Logger.logToRemote(LogLevel.WARN, message, data);
    }
  }

  /**
   * 에러 로그
   */
  static error(message: string, error?: any): void {
    if (Logger.shouldLog(LogLevel.ERROR)) {
      Logger.logToConsole(LogLevel.ERROR, message, error);
      Logger.logToRemote(LogLevel.ERROR, message, error);
    }
  }

  /**
   * API 요청 로그
   */
  static apiRequest(method: string, url: string, data?: any): void {
    Logger.debug(`API Request: ${method} ${url}`, data);
  }

  /**
   * API 응답 로그
   */
  static apiResponse(method: string, url: string, status: number, data?: any): void {
    const message = `API Response: ${method} ${url} - ${status}`;
    
    if (status >= 400) {
      Logger.warn(message, data);
    } else {
      Logger.debug(message, data);
    }
  }

  /**
   * 사용자 액션 로그
   */
  static userAction(action: string, data?: any): void {
    Logger.info(`User Action: ${action}`, data);
  }

  /**
   * 성능 로그
   */
  static performance(operation: string, duration: number, data?: any): void {
    Logger.info(`Performance: ${operation} took ${duration}ms`, data);
  }
}

/**
 * 성능 측정 유틸리티
 */
export class PerformanceTracker {
  private static timers: Map<string, number> = new Map();

  /**
   * 성능 측정 시작
   */
  static start(key: string): void {
    PerformanceTracker.timers.set(key, performance.now());
  }

  /**
   * 성능 측정 종료 및 로그
   */
  static end(key: string, data?: any): number {
    const startTime = PerformanceTracker.timers.get(key);
    if (startTime === undefined) {
      Logger.warn(`Performance timer '${key}' not found`);
      return 0;
    }

    const duration = performance.now() - startTime;
    PerformanceTracker.timers.delete(key);
    
    Logger.performance(key, duration, data);
    return duration;
  }

  /**
   * 함수 실행 시간 측정
   */
  static async measure<T>(
    key: string,
    fn: () => Promise<T> | T,
    data?: any
  ): Promise<T> {
    PerformanceTracker.start(key);
    try {
      const result = await fn();
      PerformanceTracker.end(key, data);
      return result;
    } catch (error) {
      PerformanceTracker.end(key, { ...data, error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }
}