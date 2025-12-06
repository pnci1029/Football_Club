/**
 * 브라우저 콘솔에서 바로 사용할 수 있는 API 테스터
 * 개발자 도구 콘솔에서 window.testAllApis() 실행
 */

import { adminService } from '../services/adminService';
import { teamService } from '../services/teamService';
import { playerService } from '../services/playerService';
import { stadiumService } from '../services/stadiumService';

interface TestResult {
  service: string;
  method: string;
  success: boolean;
  error?: string;
  data?: any;
}

class ApiTester {
  private results: TestResult[] = [];

  async testAdminServices(): Promise<TestResult[]> {
    const tests = [
      { service: 'adminService', method: 'getDashboardStats', fn: () => adminService.getDashboardStats() },
    ];

    for (const test of tests) {
      try {
        const data = await test.fn();
        this.results.push({ 
          service: test.service, 
          method: test.method, 
          success: true, 
          data: Array.isArray(data) ? `Array(${data.length})` : typeof data 
        });
      } catch (error) {
        this.results.push({ 
          service: test.service, 
          method: test.method, 
          success: false, 
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return this.results;
  }

  async testPublicServices(): Promise<TestResult[]> {
    const tests = [
      { service: 'teamService', method: 'getAllTeams', fn: () => teamService.getAllTeams() },
      { service: 'playerService', method: 'getPlayers', fn: () => playerService.getPlayers() },
      { service: 'stadiumService', method: 'getStadiums', fn: () => stadiumService.getStadiums() },
    ];

    for (const test of tests) {
      try {
        const data = await test.fn();
        this.results.push({ 
          service: test.service, 
          method: test.method, 
          success: true, 
          data: Array.isArray(data) ? `Array(${data.length})` : typeof data 
        });
      } catch (error) {
        this.results.push({ 
          service: test.service, 
          method: test.method, 
          success: false, 
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return this.results;
  }

  async testSpecificEndpoints(): Promise<TestResult[]> {
    const tests = [
      { 
        service: 'teamService', 
        method: 'getTeamByCode("nonexistent")', 
        fn: () => teamService.getTeamByCode('nonexistent'),
        expectError: true 
      },
    ];

    for (const test of tests) {
      try {
        const data = await test.fn();
        if (test.expectError) {
          this.results.push({ 
            service: test.service, 
            method: test.method, 
            success: false, 
            error: 'Expected error but got success'
          });
        } else {
          this.results.push({ 
            service: test.service, 
            method: test.method, 
            success: true, 
            data: Array.isArray(data) ? `Array(${data.length})` : typeof data 
          });
        }
      } catch (error) {
        if (test.expectError) {
          this.results.push({ 
            service: test.service, 
            method: test.method, 
            success: true, 
            data: '예상된 에러 발생'
          });
        } else {
          this.results.push({ 
            service: test.service, 
            method: test.method, 
            success: false, 
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }
    }

    return this.results;
  }

  async runAllTests(): Promise<TestResult[]> {
    this.results = [];
    
    await this.testAdminServices();
    await this.testPublicServices();
    await this.testSpecificEndpoints();
    
    // 실패한 테스트 상세 정보
    const failed = this.results.filter(r => !r.success);
    if (failed.length > 0) {
      console.error('실패한 테스트들:', failed.map(result => `${result.service}.${result.method}: ${result.error}`));
    }

    console.table(this.results);

    return this.results;
  }
}

// 전역 함수로 등록
const apiTester = new ApiTester();

if (typeof window !== 'undefined') {
  (window as any).testAllApis = () => apiTester.runAllTests();
  (window as any).testAdminApis = () => apiTester.testAdminServices();
  (window as any).testPublicApis = () => apiTester.testPublicServices();
}

export { ApiTester };