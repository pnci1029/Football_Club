/**
 * API 커버리지 리포트 - 모든 64개 API 메서드 테스트 및 상태 리포트
 */

import {
  Admin,
  Teams,
  Players,
  Stadiums,
  Matches,
  Inquiries,
  HeroSlides,
  Auth,
  Images,
} from '../api';

interface ApiTestResult {
  name: string;
  category: string;
  status: 'SUCCESS' | 'AUTH_ERROR' | 'NOT_FOUND' | 'CORS_ERROR' | 'SERVER_ERROR' | 'UNKNOWN_ERROR';
  statusCode?: number;
  responseTime: number;
  error?: string;
}

describe('API Coverage Report', () => {
  const testResults: ApiTestResult[] = [];

  const testApiCall = async (
    name: string,
    category: string,
    apiCall: () => Promise<any>
  ): Promise<ApiTestResult> => {
    const startTime = Date.now();
    try {
      await apiCall();
      return {
        name,
        category,
        status: 'SUCCESS',
        responseTime: Date.now() - startTime,
      };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      let status: ApiTestResult['status'] = 'UNKNOWN_ERROR';
      
      if (error.message?.includes('CORS') || error.message?.includes('preflight')) {
        status = 'CORS_ERROR';
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        status = 'AUTH_ERROR';
      } else if (error.response?.status === 404) {
        status = 'NOT_FOUND';
      } else if (error.response?.status >= 500) {
        status = 'SERVER_ERROR';
      }

      return {
        name,
        category,
        status,
        statusCode: error.response?.status,
        responseTime,
        error: error.message,
      };
    }
  };

  afterAll(() => {
    // 테스트 결과 요약 출력
    console.log('\n=== API Coverage Report ===\n');
    
    const categories = Array.from(new Set(testResults.map(r => r.category)));
    
    categories.forEach(category => {
      const categoryResults = testResults.filter(r => r.category === category);
      console.log(`📂 ${category} (${categoryResults.length} APIs):`);
      
      categoryResults.forEach(result => {
        let statusIcon = '❌';
        if (result.status === 'SUCCESS') statusIcon = '✅';
        else if (result.status === 'AUTH_ERROR') statusIcon = '🔐';
        else if (result.status === 'NOT_FOUND') statusIcon = '🔍';
        else if (result.status === 'CORS_ERROR') statusIcon = '🚫';
        
        console.log(`  ${statusIcon} ${result.name} (${result.responseTime}ms) ${result.statusCode ? `[${result.statusCode}]` : ''}`);
      });
      console.log('');
    });

    // 전체 통계
    const totalApis = testResults.length;
    const successCount = testResults.filter(r => r.status === 'SUCCESS').length;
    const authErrorCount = testResults.filter(r => r.status === 'AUTH_ERROR').length;
    const notFoundCount = testResults.filter(r => r.status === 'NOT_FOUND').length;
    const corsErrorCount = testResults.filter(r => r.status === 'CORS_ERROR').length;
    const serverErrorCount = testResults.filter(r => r.status === 'SERVER_ERROR').length;
    
    console.log('📊 Summary:');
    console.log(`  Total APIs: ${totalApis}`);
    console.log(`  ✅ Success: ${successCount} (${(successCount/totalApis*100).toFixed(1)}%)`);
    console.log(`  🔐 Auth Errors: ${authErrorCount} (${(authErrorCount/totalApis*100).toFixed(1)}%)`);
    console.log(`  🔍 Not Found: ${notFoundCount} (${(notFoundCount/totalApis*100).toFixed(1)}%)`);
    console.log(`  🚫 CORS Errors: ${corsErrorCount} (${(corsErrorCount/totalApis*100).toFixed(1)}%)`);
    console.log(`  ❌ Server Errors: ${serverErrorCount} (${(serverErrorCount/totalApis*100).toFixed(1)}%)`);
    console.log(`  💥 Other Errors: ${totalApis - successCount - authErrorCount - notFoundCount - corsErrorCount - serverErrorCount}`);
    
    const avgResponseTime = testResults.reduce((sum, r) => sum + r.responseTime, 0) / totalApis;
    console.log(`  ⏱️  Average Response Time: ${avgResponseTime.toFixed(0)}ms`);
  });

  // 1. Admin APIs (32 methods)
  describe('Admin APIs', () => {
    test('Admin Dashboard APIs', async () => {
      testResults.push(await testApiCall('getStats', 'Admin Dashboard', () => Admin.dashboard.getStats()));
      testResults.push(await testApiCall('getTeamStats', 'Admin Dashboard', () => Admin.dashboard.getTeamStats(1)));
    });

    test('Admin Inquiries APIs', async () => {
      testResults.push(await testApiCall('getAll', 'Admin Inquiries', () => Admin.inquiries.getAll()));
      testResults.push(await testApiCall('getById', 'Admin Inquiries', () => Admin.inquiries.getById(1)));
      testResults.push(await testApiCall('getByStatus', 'Admin Inquiries', () => Admin.inquiries.getByStatus('PENDING')));
      testResults.push(await testApiCall('getStats', 'Admin Inquiries', () => Admin.inquiries.getStats()));
      testResults.push(await testApiCall('getRecent', 'Admin Inquiries', () => Admin.inquiries.getRecent(5)));
      testResults.push(await testApiCall('updateStatus', 'Admin Inquiries', () => Admin.inquiries.updateStatus(1, { status: 'IN_PROGRESS' })));
    });

    test('Admin Tenants APIs', async () => {
      testResults.push(await testApiCall('getAll', 'Admin Tenants', () => Admin.tenants.getAll()));
      testResults.push(await testApiCall('getByCode', 'Admin Tenants', () => Admin.tenants.getByCode('test')));
      testResults.push(await testApiCall('getDashboard', 'Admin Tenants', () => Admin.tenants.getDashboard('test')));
      testResults.push(await testApiCall('getPlayers', 'Admin Tenants', () => Admin.tenants.getPlayers('test')));
      testResults.push(await testApiCall('getStadiums', 'Admin Tenants', () => Admin.tenants.getStadiums('test')));
      testResults.push(await testApiCall('updateSettings', 'Admin Tenants', () => Admin.tenants.updateSettings('test', {})));
      testResults.push(await testApiCall('create', 'Admin Tenants', () => Admin.tenants.create({ name: 'Test', code: 'test', description: 'Test description' })));
    });

    test('Admin Teams APIs', async () => {
      testResults.push(await testApiCall('getAll', 'Admin Teams', () => Teams.admin.getAll()));
      testResults.push(await testApiCall('getById', 'Admin Teams', () => Teams.admin.getById(1)));
      testResults.push(await testApiCall('getByCode', 'Admin Teams', () => Teams.admin.getByCode('test')));
      testResults.push(await testApiCall('create', 'Admin Teams', () => Teams.admin.create({ name: 'Test', code: 'TEST', description: 'Test description' })));
      testResults.push(await testApiCall('update', 'Admin Teams', () => Teams.admin.update(1, { name: 'Updated' })));
      testResults.push(await testApiCall('delete', 'Admin Teams', () => Teams.admin.delete(999)));
      testResults.push(await testApiCall('getStats', 'Admin Teams', () => Teams.admin.getStats(1)));
    });

    test('Admin Players APIs', async () => {
      testResults.push(await testApiCall('getAll', 'Admin Players', () => Players.admin.getAll(1)));
      testResults.push(await testApiCall('getById', 'Admin Players', () => Players.admin.getById(1)));
      testResults.push(await testApiCall('create', 'Admin Players', () => Players.admin.create(1, { name: 'Test', backNumber: 99, position: 'FW' })));
      testResults.push(await testApiCall('update', 'Admin Players', () => Players.admin.update(1, { name: 'Updated' })));
      testResults.push(await testApiCall('delete', 'Admin Players', () => Players.admin.delete(999)));
    });

    test('Admin Stadiums APIs', async () => {
      testResults.push(await testApiCall('getAll', 'Admin Stadiums', () => Stadiums.admin.getAll()));
      testResults.push(await testApiCall('getById', 'Admin Stadiums', () => Stadiums.admin.getById(1)));
      testResults.push(await testApiCall('create', 'Admin Stadiums', () => Stadiums.admin.create({ name: 'Test', address: 'Test', latitude: 37.5665, longitude: 126.9780 })));
      testResults.push(await testApiCall('update', 'Admin Stadiums', () => Stadiums.admin.update(1, { name: 'Updated' })));
      testResults.push(await testApiCall('delete', 'Admin Stadiums', () => Stadiums.admin.delete(999)));
    });

    test('Admin Matches APIs', async () => {
      testResults.push(await testApiCall('getAll', 'Admin Matches', () => Matches.admin.getAll()));
      testResults.push(await testApiCall('getById', 'Admin Matches', () => Matches.admin.getById(1)));
      testResults.push(await testApiCall('getByTeam', 'Admin Matches', () => Matches.admin.getByTeam(1)));
      testResults.push(await testApiCall('create', 'Admin Matches', () => Matches.admin.create({ homeTeamId: 1, awayTeamId: 2, matchDate: '2024-01-01T15:00:00', stadiumId: 1 })));
      testResults.push(await testApiCall('update', 'Admin Matches', () => Matches.admin.update(1, { status: 'IN_PROGRESS' })));
      testResults.push(await testApiCall('delete', 'Admin Matches', () => Matches.admin.delete(999)));
    });

    test('Admin HeroSlides APIs', async () => {
      testResults.push(await testApiCall('getAll', 'Admin HeroSlides', () => HeroSlides.admin.getAll()));
      testResults.push(await testApiCall('getById', 'Admin HeroSlides', () => HeroSlides.admin.getById(1)));
      testResults.push(await testApiCall('create', 'Admin HeroSlides', () => HeroSlides.admin.create({ title: 'Test', content: 'Test', imageUrl: 'test.jpg', sortOrder: 1, isActive: true })));
      testResults.push(await testApiCall('update', 'Admin HeroSlides', () => HeroSlides.admin.update(1, { title: 'Updated' })));
      testResults.push(await testApiCall('delete', 'Admin HeroSlides', () => HeroSlides.admin.delete(999)));
      testResults.push(await testApiCall('updateOrder', 'Admin HeroSlides', () => HeroSlides.admin.updateOrder(1, 2)));
      testResults.push(await testApiCall('updateActive', 'Admin HeroSlides', () => HeroSlides.admin.updateActive(1, false)));
    });
  });

  // 2. Public APIs (15 methods)
  describe('Public APIs', () => {
    test('Public Teams APIs', async () => {
      testResults.push(await testApiCall('getAll', 'Public Teams', () => Teams.public.getAll()));
      testResults.push(await testApiCall('getById', 'Public Teams', () => Teams.public.getById(1)));
      testResults.push(await testApiCall('getByCode', 'Public Teams', () => Teams.public.getByCode('test')));
    });

    test('Public Players APIs', async () => {
      testResults.push(await testApiCall('getAll', 'Public Players', () => Players.public.getAll()));
      testResults.push(await testApiCall('getById', 'Public Players', () => Players.public.getById(1)));
      testResults.push(await testApiCall('getActive', 'Public Players', () => Players.public.getActive()));
    });

    test('Public Stadiums APIs', async () => {
      testResults.push(await testApiCall('getAll', 'Public Stadiums', () => Stadiums.public.getAll()));
      testResults.push(await testApiCall('getById', 'Public Stadiums', () => Stadiums.public.getById(1)));
    });

    test('Public Matches APIs', async () => {
      testResults.push(await testApiCall('getAll', 'Public Matches', () => Matches.public.getAll()));
      testResults.push(await testApiCall('getById', 'Public Matches', () => Matches.public.getById(1)));
      testResults.push(await testApiCall('getByTeam', 'Public Matches', () => Matches.public.getByTeam(1)));
      testResults.push(await testApiCall('getUpcoming', 'Public Matches', () => Matches.public.getUpcoming(1)));
    });

    test('Public HeroSlides APIs', async () => {
      testResults.push(await testApiCall('getActive', 'Public HeroSlides', () => HeroSlides.public.getActive()));
    });
  });

  // 3. Other Services (17 methods)
  describe('Other Services', () => {
    test('Auth APIs', async () => {
      testResults.push(await testApiCall('login', 'Auth', () => Auth.api.login({ username: 'test@test.com', password: 'test' })));
      testResults.push(await testApiCall('register', 'Auth', () => Auth.api.register({ email: 'test@test.com', password: 'test', name: 'Test', confirmPassword: 'test' })));
      testResults.push(await testApiCall('logout', 'Auth', () => Auth.api.logout()));
      testResults.push(await testApiCall('getMe', 'Auth', () => Auth.api.getMe()));
      testResults.push(await testApiCall('refresh', 'Auth', () => Auth.api.refresh()));
    });

    test('Inquiries APIs', async () => {
      testResults.push(await testApiCall('create', 'Inquiries', () => Inquiries.public.create({ title: 'Test Inquiry', content: 'Test content', name: 'Test User', email: 'test@test.com', message: 'Test', category: 'GENERAL' })));
      testResults.push(await testApiCall('getMy', 'Inquiries', () => Inquiries.public.getMy()));
      testResults.push(await testApiCall('getById', 'Inquiries', () => Inquiries.public.getById(1)));
    });

    test('Images APIs', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      testResults.push(await testApiCall('upload', 'Images', () => Images.api.upload(mockFile)));
      testResults.push(await testApiCall('generateUrl', 'Images', () => Images.api.generateUrl('test-key')));
    });
  });

  // 4. Convenience Methods Tests
  describe('Convenience Methods', () => {
    test('Search and Utility Methods', async () => {
      testResults.push(await testApiCall('Teams.search', 'Convenience', () => Teams.search('test')));
      testResults.push(await testApiCall('Players.searchByName', 'Convenience', () => Players.searchByName('test')));
      testResults.push(await testApiCall('Stadiums.searchByName', 'Convenience', () => Stadiums.searchByName('test')));
      testResults.push(await testApiCall('Matches.getByStatus', 'Convenience', () => Matches.getByStatus('SCHEDULED')));
      testResults.push(await testApiCall('Admin.getSystemOverview', 'Convenience', () => Admin.getSystemOverview()));
      testResults.push(await testApiCall('Admin.getPendingInquiriesCount', 'Convenience', () => Admin.getPendingInquiriesCount()));
      testResults.push(await testApiCall('HeroSlides.getActiveSlides', 'Convenience', () => HeroSlides.getActiveSlides()));
    });
  });
});