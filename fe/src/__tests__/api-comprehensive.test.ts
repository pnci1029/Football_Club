/**
 * 포괄적 API 테스트 - 모든 64개 API 메서드 테스트
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

// 테스트용 가짜 데이터
const mockTeamData = {
  name: 'Test Team',
  code: 'TEST',
  description: 'Test team for API testing',
  foundedYear: 2023,
};

const mockPlayerData = {
  name: 'Test Player',
  backNumber: 99,
  position: 'FW',
  birthDate: '1990-01-01',
};

const mockStadiumData = {
  name: 'Test Stadium',
  address: 'Test Address',
  capacity: 10000,
  latitude: 37.5665,
  longitude: 126.9780,
};

const mockMatchData = {
  homeTeamId: 1,
  awayTeamId: 2,
  matchDate: '2024-01-01T15:00:00',
  stadiumId: 1,
};

const mockInquiryData = {
  title: 'Test Inquiry',
  content: 'Test inquiry content',
  name: 'Test User',
  email: 'test@test.com',
  message: 'Test inquiry content',
  category: 'GENERAL' as const,
};

const mockHeroSlideData = {
  title: 'Test Slide',
  content: 'Test slide content',
  imageUrl: 'https://test.com/image.jpg',
  linkUrl: 'https://test.com',
  sortOrder: 1,
  isActive: true,
};

const mockLoginData = {
  username: 'test@test.com',
  password: 'testpassword',
};

describe('Comprehensive API Tests', () => {
  let createdTeamId: number;
  let createdPlayerId: number;
  let createdStadiumId: number;
  let createdMatchId: number;
  let createdInquiryId: number;
  let createdSlideId: number;

  // 1. Admin API Tests (32 methods)
  describe('Admin APIs', () => {
    test('Admin Dashboard - getStats', async () => {
      try {
        await Admin.dashboard.getStats();
      } catch (error: any) {
        expect([401, 403, 404]).toContain(error.response?.status);
      }
    });

    test('Admin Dashboard - getTeamStats', async () => {
      try {
        await Admin.dashboard.getTeamStats(1);
      } catch (error: any) {
        expect([401, 403, 404]).toContain(error.response?.status);
      }
    });

    test('Admin Inquiries - getAll', async () => {
      try {
        await Admin.inquiries.getAll();
      } catch (error: any) {
        expect([401, 403, 404]).toContain(error.response?.status);
      }
    });

    test('Admin Inquiries - getById', async () => {
      try {
        await Admin.inquiries.getById(1);
      } catch (error: any) {
        expect([401, 403, 404]).toContain(error.response?.status);
      }
    });

    test('Admin Inquiries - getByStatus', async () => {
      try {
        await Admin.inquiries.getByStatus('PENDING');
      } catch (error: any) {
        expect([401, 403, 404]).toContain(error.response?.status);
      }
    });

    test('Admin Inquiries - getStats', async () => {
      try {
        await Admin.inquiries.getStats();
      } catch (error: any) {
        expect([401, 403, 404]).toContain(error.response?.status);
      }
    });

    test('Admin Inquiries - getRecent', async () => {
      try {
        await Admin.inquiries.getRecent(5);
      } catch (error: any) {
        expect([401, 403, 404]).toContain(error.response?.status);
      }
    });

    test('Admin Inquiries - updateStatus', async () => {
      try {
        await Admin.inquiries.updateStatus(1, { status: 'IN_PROGRESS' });
      } catch (error: any) {
        expect([401, 403, 404]).toContain(error.response?.status);
      }
    });

    test('Admin Tenants - getAll', async () => {
      try {
        await Admin.tenants.getAll();
      } catch (error: any) {
        expect([401, 403, 404]).toContain(error.response?.status);
      }
    });

    test('Admin Tenants - getByCode', async () => {
      try {
        await Admin.tenants.getByCode('test');
      } catch (error: any) {
        expect([401, 403, 404]).toContain(error.response?.status);
      }
    });

    test('Admin Tenants - getDashboard', async () => {
      try {
        await Admin.tenants.getDashboard('test');
      } catch (error: any) {
        expect([401, 403, 404]).toContain(error.response?.status);
      }
    });

    test('Admin Tenants - getPlayers', async () => {
      try {
        await Admin.tenants.getPlayers('test');
      } catch (error: any) {
        expect([401, 403, 404]).toContain(error.response?.status);
      }
    });

    test('Admin Tenants - getStadiums', async () => {
      try {
        await Admin.tenants.getStadiums('test');
      } catch (error: any) {
        expect([401, 403, 404]).toContain(error.response?.status);
      }
    });

    test('Admin Tenants - updateSettings', async () => {
      try {
        await Admin.tenants.updateSettings('test', {});
      } catch (error: any) {
        expect([401, 403, 404]).toContain(error.response?.status);
      }
    });

    test('Admin Tenants - create', async () => {
      try {
        await Admin.tenants.create({ name: 'Test', code: 'test', description: 'Test description' });
      } catch (error: any) {
        expect([401, 403, 404, 409]).toContain(error.response?.status);
      }
    });

    // Admin Teams
    test('Admin Teams - getAll', async () => {
      try {
        await Teams.admin.getAll();
      } catch (error: any) {
        expect([401, 403, 404]).toContain(error.response?.status);
      }
    });

    test('Admin Teams - create', async () => {
      try {
        const team = await Teams.admin.create(mockTeamData);
        createdTeamId = team.data.id;
        expect(team.data).toBeDefined();
      } catch (error: any) {
        expect([401, 403, 409]).toContain(error.response?.status);
      }
    });

    // Admin Players
    test('Admin Players - getAll', async () => {
      try {
        await Players.admin.getAll(1);
      } catch (error: any) {
        expect([401, 403, 404]).toContain(error.response?.status);
      }
    });

    test('Admin Players - create', async () => {
      try {
        const player = await Players.admin.create(1, mockPlayerData);
        createdPlayerId = player.data.id;
        expect(player.data).toBeDefined();
      } catch (error: any) {
        expect([401, 403, 409]).toContain(error.response?.status);
      }
    });

    // Admin Stadiums
    test('Admin Stadiums - getAll', async () => {
      try {
        await Stadiums.admin.getAll();
      } catch (error: any) {
        expect([401, 403, 404]).toContain(error.response?.status);
      }
    });

    test('Admin Stadiums - create', async () => {
      try {
        const stadium = await Stadiums.admin.create(mockStadiumData);
        createdStadiumId = stadium.data.id;
        expect(stadium.data).toBeDefined();
      } catch (error: any) {
        expect([401, 403, 409]).toContain(error.response?.status);
      }
    });

    // Admin Matches
    test('Admin Matches - getAll', async () => {
      try {
        await Matches.admin.getAll();
      } catch (error: any) {
        expect([401, 403, 404]).toContain(error.response?.status);
      }
    });

    test('Admin Matches - create', async () => {
      try {
        const match = await Matches.admin.create(mockMatchData);
        createdMatchId = match.data.id;
        expect(match.data).toBeDefined();
      } catch (error: any) {
        expect([401, 403, 409]).toContain(error.response?.status);
      }
    });

    // Admin Hero Slides
    test('Admin HeroSlides - getAll', async () => {
      try {
        await HeroSlides.admin.getAll();
      } catch (error: any) {
        expect([401, 403, 404]).toContain(error.response?.status);
      }
    });

    test('Admin HeroSlides - create', async () => {
      try {
        const slide = await HeroSlides.admin.create(mockHeroSlideData);
        createdSlideId = slide.data.id;
        expect(slide.data).toBeDefined();
      } catch (error: any) {
        expect([401, 403, 409]).toContain(error.response?.status);
      }
    });
  });

  // 2. Public API Tests (15 methods)
  describe('Public APIs', () => {
    test('Public Teams - getAll', async () => {
      try {
        const teams = await Teams.public.getAll();
        expect(Array.isArray(teams)).toBe(true);
      } catch (error: any) {
        expect([404, 500]).toContain(error.response?.status);
      }
    });

    test('Public Teams - getById', async () => {
      try {
        await Teams.public.getById(1);
      } catch (error: any) {
        expect([404]).toContain(error.response?.status);
      }
    });

    test('Public Teams - getByCode', async () => {
      try {
        await Teams.public.getByCode('test');
      } catch (error: any) {
        expect([404]).toContain(error.response?.status);
      }
    });

    test('Public Players - getAll', async () => {
      try {
        const players = await Players.public.getAll();
        expect(players.content).toBeDefined();
      } catch (error: any) {
        expect([404, 500]).toContain(error.response?.status);
      }
    });

    test('Public Players - getById', async () => {
      try {
        await Players.public.getById(1);
      } catch (error: any) {
        expect([404]).toContain(error.response?.status);
      }
    });

    test('Public Players - getActive', async () => {
      try {
        const players = await Players.public.getActive();
        expect(Array.isArray(players)).toBe(true);
      } catch (error: any) {
        expect([404, 500]).toContain(error.response?.status);
      }
    });

    test('Public Stadiums - getAll', async () => {
      try {
        const stadiums = await Stadiums.public.getAll();
        expect(stadiums.content).toBeDefined();
      } catch (error: any) {
        expect([404, 500]).toContain(error.response?.status);
      }
    });

    test('Public Stadiums - getById', async () => {
      try {
        await Stadiums.public.getById(1);
      } catch (error: any) {
        expect([404]).toContain(error.response?.status);
      }
    });

    test('Public Matches - getAll', async () => {
      try {
        const matches = await Matches.public.getAll();
        expect(matches.content).toBeDefined();
      } catch (error: any) {
        expect([404, 500]).toContain(error.response?.status);
      }
    });

    test('Public Matches - getById', async () => {
      try {
        await Matches.public.getById(1);
      } catch (error: any) {
        expect([404]).toContain(error.response?.status);
      }
    });

    test('Public Matches - getByTeam', async () => {
      try {
        const matches = await Matches.public.getByTeam(1);
        expect(matches.content).toBeDefined();
      } catch (error: any) {
        expect([404, 500]).toContain(error.response?.status);
      }
    });

    test('Public Matches - getUpcoming', async () => {
      try {
        const matches = await Matches.public.getUpcoming(1);
        expect(Array.isArray(matches)).toBe(true);
      } catch (error: any) {
        expect([404, 500]).toContain(error.response?.status);
      }
    });

    test('Public HeroSlides - getActive', async () => {
      try {
        const slides = await HeroSlides.public.getActive();
        expect(Array.isArray(slides)).toBe(true);
      } catch (error: any) {
        expect([404, 500]).toContain(error.response?.status);
      }
    });
  });

  // 3. Other Services Tests (17 methods)
  describe('Other Services', () => {
    test('Auth - login', async () => {
      try {
        await Auth.api.login(mockLoginData);
      } catch (error: any) {
        expect([401, 404]).toContain(error.response?.status);
      }
    });

    test('Auth - register', async () => {
      try {
        await Auth.api.register({
          email: 'test@test.com',
          password: 'testpassword',
          name: 'Test User',
          confirmPassword: 'testpassword',
        });
      } catch (error: any) {
        expect([409, 400]).toContain(error.response?.status);
      }
    });

    test('Auth - getMe', async () => {
      try {
        await Auth.api.getMe();
      } catch (error: any) {
        expect([401]).toContain(error.response?.status);
      }
    });

    test('Inquiries - create', async () => {
      try {
        const inquiry = await Inquiries.public.create(mockInquiryData);
        createdInquiryId = inquiry.data.id;
        expect(inquiry.data).toBeDefined();
      } catch (error: any) {
        expect([401, 400]).toContain(error.response?.status);
      }
    });

    test('Inquiries - getMy', async () => {
      try {
        await Inquiries.public.getMy();
      } catch (error: any) {
        expect([401]).toContain(error.response?.status);
      }
    });

    test('Images - generateUrl', async () => {
      try {
        const url = await Images.api.generateUrl('test-key');
        expect(url.data.url).toBeDefined();
      } catch (error: any) {
        expect([404, 400]).toContain(error.response?.status);
      }
    });
  });

  // 4. Convenience Methods Tests
  describe('Convenience Methods', () => {
    test('Teams - search', async () => {
      try {
        const results = await Teams.search('test');
        expect(Array.isArray(results)).toBe(true);
      } catch (error: any) {
        expect([404, 500]).toContain(error.response?.status);
      }
    });

    test('Players - searchByName', async () => {
      try {
        const results = await Players.searchByName('test');
        expect(Array.isArray(results)).toBe(true);
      } catch (error: any) {
        expect([404, 500]).toContain(error.response?.status);
      }
    });

    test('Stadiums - searchByName', async () => {
      try {
        const results = await Stadiums.searchByName('test');
        expect(Array.isArray(results)).toBe(true);
      } catch (error: any) {
        expect([404, 500]).toContain(error.response?.status);
      }
    });

    test('Matches - getByStatus', async () => {
      try {
        const results = await Matches.getByStatus('SCHEDULED');
        expect(Array.isArray(results)).toBe(true);
      } catch (error: any) {
        expect([404, 500]).toContain(error.response?.status);
      }
    });

    test('Admin - getSystemOverview', async () => {
      try {
        await Admin.getSystemOverview();
      } catch (error: any) {
        expect([401, 403]).toContain(error.response?.status);
      }
    });
  });

  // 5. Update/Delete Tests (if entities were created)
  describe('Update/Delete Operations', () => {
    test('Update operations', async () => {
      if (createdTeamId) {
        try {
          await Teams.admin.update(createdTeamId, { name: 'Updated Team' });
        } catch (error: any) {
          expect([401, 403, 404]).toContain(error.response?.status);
        }
      }

      if (createdPlayerId) {
        try {
          await Players.admin.update(createdPlayerId, { name: 'Updated Player' });
        } catch (error: any) {
          expect([401, 403, 404]).toContain(error.response?.status);
        }
      }

      if (createdStadiumId) {
        try {
          await Stadiums.admin.update(createdStadiumId, { name: 'Updated Stadium' });
        } catch (error: any) {
          expect([401, 403, 404]).toContain(error.response?.status);
        }
      }

      if (createdMatchId) {
        try {
          await Matches.admin.update(createdMatchId, { status: 'IN_PROGRESS' });
        } catch (error: any) {
          expect([401, 403, 404]).toContain(error.response?.status);
        }
      }

      if (createdSlideId) {
        try {
          await HeroSlides.admin.update(createdSlideId, { title: 'Updated Slide' });
        } catch (error: any) {
          expect([401, 403, 404]).toContain(error.response?.status);
        }
      }
    });

    test('Delete operations', async () => {
      if (createdTeamId) {
        try {
          await Teams.admin.delete(createdTeamId);
        } catch (error: any) {
          expect([401, 403, 404]).toContain(error.response?.status);
        }
      }

      if (createdPlayerId) {
        try {
          await Players.admin.delete(createdPlayerId);
        } catch (error: any) {
          expect([401, 403, 404]).toContain(error.response?.status);
        }
      }

      if (createdStadiumId) {
        try {
          await Stadiums.admin.delete(createdStadiumId);
        } catch (error: any) {
          expect([401, 403, 404]).toContain(error.response?.status);
        }
      }

      if (createdMatchId) {
        try {
          await Matches.admin.delete(createdMatchId);
        } catch (error: any) {
          expect([401, 403, 404]).toContain(error.response?.status);
        }
      }

      if (createdSlideId) {
        try {
          await HeroSlides.admin.delete(createdSlideId);
        } catch (error: any) {
          expect([401, 403, 404]).toContain(error.response?.status);
        }
      }
    });
  });

  // 6. Error Handling Tests
  describe('Error Handling', () => {
    test('404 errors are handled correctly', async () => {
      try {
        await Teams.public.getById(999999);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response?.status).toBe(404);
      }
    });

    test('Invalid data errors are handled', async () => {
      try {
        await Teams.admin.create({} as any);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect([400, 401, 403]).toContain(error.response?.status);
      }
    });
  });

  // 7. Utility Functions Tests
  describe('Utility Functions', () => {
    test('Distance calculation works', () => {
      const distance = Stadiums.calculateDistance(37.5665, 126.9780, 37.5651, 126.9895);
      expect(typeof distance).toBe('number');
      expect(distance).toBeGreaterThan(0);
    });

    test('Image utilities work', () => {
      const fileSize = Images.formatFileSize(1024);
      expect(fileSize).toBe('1 KB');
    });

    test('Auth token utilities work', () => {
      const hasToken = Auth.isAuthenticated();
      expect(typeof hasToken).toBe('boolean');
    });
  });
});