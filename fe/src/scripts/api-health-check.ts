/**
 * API Health Check 스크립트
 * 모든 API 엔드포인트의 연결 상태를 확인합니다
 * 
 * 사용법: npm run test-api
 */

import { getApiBaseUrl } from '../utils/config';

interface EndpointTest {
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  expectedStatus?: number;
  testData?: any;
}

const API_BASE = getApiBaseUrl();

// 테스트할 API 엔드포인트 목록
const ENDPOINTS: EndpointTest[] = [
  // 관리자 API
  { name: 'Dashboard Stats', method: 'GET', url: '/api/v1/admin/dashboard', expectedStatus: 200 },
  { name: 'Admin Teams', method: 'GET', url: '/api/v1/admin/teams', expectedStatus: 200 },
  { name: 'Admin Players', method: 'GET', url: '/api/v1/admin/players', expectedStatus: 200 },
  { name: 'Admin Stadiums', method: 'GET', url: '/api/v1/admin/stadiums', expectedStatus: 200 },
  { name: 'Admin Matches', method: 'GET', url: '/api/v1/admin/matches', expectedStatus: 200 },

  // 공용 API
  { name: 'Public Teams', method: 'GET', url: '/api/v1/teams', expectedStatus: 200 },
  { name: 'Public Players', method: 'GET', url: '/api/v1/players', expectedStatus: 200 },
  { name: 'Public Stadiums', method: 'GET', url: '/api/v1/stadiums', expectedStatus: 200 },
  { name: 'Public Matches', method: 'GET', url: '/api/v1/matches', expectedStatus: 200 },

  // 특정 리소스 조회 (존재하지 않는 ID로 404 테스트)
  { name: 'Team by Code (404 test)', method: 'GET', url: '/api/v1/teams/nonexistent', expectedStatus: 404 },
  { name: 'Player by ID (404 test)', method: 'GET', url: '/api/v1/players/99999', expectedStatus: 404 },
];

async function testEndpoint(endpoint: EndpointTest): Promise<{ success: boolean; status?: number; error?: string }> {
  try {
    const fullUrl = `${API_BASE}${endpoint.url}`;
    
    const response = await fetch(fullUrl, {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-Host': window.location.host,
      },
      ...(endpoint.testData && { body: JSON.stringify(endpoint.testData) })
    });

    const expectedStatus = endpoint.expectedStatus || 200;
    const success = response.status === expectedStatus;

    return {
      success,
      status: response.status,
      error: success ? undefined : `Expected ${expectedStatus}, got ${response.status}`
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export async function runApiHealthCheck(): Promise<void> {
  console.log('🚀 API Health Check 시작...');
  console.log(`📡 API Base URL: ${API_BASE}`);
  console.log('='.repeat(60));

  const results: Array<{ endpoint: EndpointTest; result: any }> = [];
  
  for (const endpoint of ENDPOINTS) {
    console.log(`📋 테스트 중: ${endpoint.name} (${endpoint.method} ${endpoint.url})`);
    
    const result = await testEndpoint(endpoint);
    results.push({ endpoint, result });
    
    if (result.success) {
      console.log(`✅ 성공 - Status: ${result.status}`);
    } else {
      console.log(`❌ 실패 - ${result.error || 'Unknown error'}`);
    }
    
    // API 호출 간격 조절 (서버 부하 방지)
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // 결과 요약
  console.log('\n' + '='.repeat(60));
  console.log('📊 테스트 결과 요약:');
  
  const successful = results.filter(r => r.result.success).length;
  const total = results.length;
  
  console.log(`✅ 성공: ${successful}/${total} (${Math.round(successful/total*100)}%)`);
  console.log(`❌ 실패: ${total - successful}/${total}`);
  
  if (successful === total) {
    console.log('🎉 모든 API 엔드포인트가 정상 작동합니다!');
  } else {
    console.log('⚠️  일부 API 엔드포인트에 문제가 있습니다.');
    
    // 실패한 엔드포인트 상세 정보
    console.log('\n❌ 실패한 엔드포인트:');
    results
      .filter(r => !r.result.success)
      .forEach(({ endpoint, result }) => {
        console.log(`  - ${endpoint.name}: ${result.error}`);
      });
  }
}

// 브라우저 콘솔에서 직접 실행 가능
if (typeof window !== 'undefined') {
  (window as any).runApiHealthCheck = runApiHealthCheck;
  console.log('💡 브라우저 콘솔에서 runApiHealthCheck() 를 실행하여 API 테스트를 할 수 있습니다.');
}