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
    console.log('🔧 Admin Services 테스트 시작...');
    
    const tests = [
      { service: 'adminService', method: 'getDashboardStats', fn: () => adminService.getDashboardStats() },
      { service: 'adminService', method: 'getTeams', fn: () => adminService.getTeams() },
      { service: 'adminService', method: 'getPlayers', fn: () => adminService.getPlayers() },
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
        console.log(`✅ ${test.service}.${test.method}() - 성공`);
      } catch (error) {
        this.results.push({ 
          service: test.service, 
          method: test.method, 
          success: false, 
          error: error instanceof Error ? error.message : String(error)
        });
        console.log(`❌ ${test.service}.${test.method}() - 실패:`, error);
      }
    }

    return this.results;
  }

  async testPublicServices(): Promise<TestResult[]> {
    console.log('🌍 Public Services 테스트 시작...');
    
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
        console.log(`✅ ${test.service}.${test.method}() - 성공`);
      } catch (error) {
        this.results.push({ 
          service: test.service, 
          method: test.method, 
          success: false, 
          error: error instanceof Error ? error.message : String(error)
        });
        console.log(`❌ ${test.service}.${test.method}() - 실패:`, error);
      }
    }

    return this.results;
  }

  async testSpecificEndpoints(): Promise<TestResult[]> {
    console.log('🎯 특정 엔드포인트 테스트 시작...');
    
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
          console.log(`⚠️  ${test.service}.${test.method} - 에러가 예상되었지만 성공함`);
        } else {
          this.results.push({ 
            service: test.service, 
            method: test.method, 
            success: true, 
            data: Array.isArray(data) ? `Array(${data.length})` : typeof data 
          });
          console.log(`✅ ${test.service}.${test.method} - 성공`);
        }
      } catch (error) {
        if (test.expectError) {
          this.results.push({ 
            service: test.service, 
            method: test.method, 
            success: true, 
            data: '예상된 에러 발생'
          });
          console.log(`✅ ${test.service}.${test.method} - 예상된 에러 발생`);
        } else {
          this.results.push({ 
            service: test.service, 
            method: test.method, 
            success: false, 
            error: error instanceof Error ? error.message : String(error)
          });
          console.log(`❌ ${test.service}.${test.method} - 실패:`, error);
        }
      }
    }

    return this.results;
  }

  async runAllTests(): Promise<TestResult[]> {
    console.log('🚀 모든 API 테스트 시작...');
    console.log('='.repeat(50));
    
    this.results = [];
    
    await this.testAdminServices();
    console.log('');
    await this.testPublicServices();
    console.log('');
    await this.testSpecificEndpoints();
    
    console.log('');
    console.log('='.repeat(50));
    console.log('📊 테스트 결과 요약:');
    
    const successful = this.results.filter(r => r.success).length;
    const total = this.results.length;
    
    console.log(`✅ 성공: ${successful}/${total} (${Math.round(successful/total*100)}%)`);
    console.log(`❌ 실패: ${total - successful}/${total}`);
    
    // 실패한 테스트 상세 정보
    const failed = this.results.filter(r => !r.success);
    if (failed.length > 0) {
      console.log('\n❌ 실패한 테스트들:');
      failed.forEach(result => {
        console.log(`  - ${result.service}.${result.method}: ${result.error}`);
      });
    }

    console.log('\n📋 전체 결과:');
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
  
  console.log('🛠️  API 테스터가 준비되었습니다!');
  console.log('사용 방법:');
  console.log('- testAllApis() - 모든 API 테스트');
  console.log('- testAdminApis() - 관리자 API 테스트');
  console.log('- testPublicApis() - 공용 API 테스트');
}

export { ApiTester };