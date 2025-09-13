# API 메서드 전체 분석 및 분류

## **분석 결과: 총 64개 API 메서드**

### **1. Admin 관련 API (32개)**

#### **Admin - Teams (6개)**
- `adminTeamService.getAllTeams()` - 모든 팀 조회 (페이징)
- `adminTeamService.createTeam()` - 팀 생성
- `adminTeamService.getTeam()` - 특정 팀 조회
- `adminTeamService.getTeamByCode()` - 코드로 팀 조회  
- `adminTeamService.updateTeam()` - 팀 수정
- `adminTeamService.deleteTeam()` - 팀 삭제

#### **Admin - Players (5개)**
- `adminPlayerService.getAllPlayers()` - 모든 선수 조회 (페이징, 검색)
- `adminPlayerService.createPlayer()` - 선수 생성
- `adminPlayerService.getPlayer()` - 특정 선수 조회
- `adminPlayerService.updatePlayer()` - 선수 수정
- `adminPlayerService.deletePlayer()` - 선수 삭제

#### **Admin - Stadiums (5개)**
- `adminStadiumService.getAllStadiums()` - 모든 구장 조회 (페이징)
- `adminStadiumService.createStadium()` - 구장 생성
- `adminStadiumService.getStadium()` - 특정 구장 조회
- `adminStadiumService.updateStadium()` - 구장 수정
- `adminStadiumService.deleteStadium()` - 구장 삭제

#### **Admin - Matches (6개)**
- `adminMatchService.getAllMatches()` - 모든 경기 조회 (페이징, 상태필터)
- `adminMatchService.getMatchesByTeam()` - 팀별 경기 조회 (페이징)
- `adminMatchService.createMatch()` - 경기 생성
- `adminMatchService.getMatch()` - 특정 경기 조회
- `adminMatchService.updateMatch()` - 경기 수정
- `adminMatchService.deleteMatch()` - 경기 삭제

#### **Admin - Inquiries (5개)**
- `adminInquiryService.getAllInquiries()` - 모든 문의 조회
- `adminInquiryService.getInquiry()` - 특정 문의 조회
- `adminInquiryService.updateInquiryStatus()` - 문의 상태 수정
- `adminInquiryService.getInquiriesByStatus()` - 상태별 문의 조회
- `adminInquiryService.getInquiryStats()` - 문의 통계
- `adminInquiryService.getRecentInquiries()` - 최근 문의들

#### **Admin - Dashboard (5개)**
- `adminService.getDashboardStats()` - 대시보드 통계
- `adminService.getTeamStats()` - 팀 통계
- `adminService.getPlayersByTeam()` - 팀별 선수 조회
- `adminService.getStadiumsByTeam()` - 팀별 구장 조회
- `adminService.getAllPlayers()` - 전체 선수 조회
- `adminService.getAllStadiums()` - 전체 구장 조회
- `adminService.getAllTeams()` - 전체 팀 조회
- `adminService.getTeams()` - 팀 목록
- `adminService.getPlayers()` - 선수 목록

### **2. Public 관련 API (15개)**

#### **Public - Teams (3개)**
- `teamService.getAllTeams()` - 모든 팀 조회
- `teamService.getTeamByCode()` - 코드로 팀 조회
- `teamService.getTeamById()` - ID로 팀 조회

#### **Public - Players (3개)**
- `playerService.getPlayers()` - 선수 조회 (페이징)
- `playerService.getPlayer()` - 특정 선수 조회
- `playerService.getActivePlayers()` - 활성 선수 조회

#### **Public - Stadiums (2개)**
- `stadiumService.getStadiums()` - 구장 조회 (페이징)
- `stadiumService.getStadium()` - 특정 구장 조회

#### **Public - Matches (4개)**
- `matchService.getMatches()` - 경기 조회 (페이징, 상태필터)
- `matchService.getMatch()` - 특정 경기 조회
- `matchService.getMatchesByTeam()` - 팀별 경기 조회
- `matchService.getUpcomingMatches()` - 다가오는 경기들

#### **Public - Inquiries (2개)**
- `inquiryService.createInquiry()` - 문의 생성
- `inquiryService.getInquiriesByEmail()` - 이메일별 문의 조회

### **3. 기타 서비스 API (17개)**

#### **Hero Slides (6개)**
- `heroService.getActiveSlides()` - 활성 슬라이드 조회
- `heroService.getAllSlides()` - 모든 슬라이드 조회
- `heroService.createSlide()` - 슬라이드 생성
- `heroService.updateSlide()` - 슬라이드 수정
- `heroService.deleteSlide()` - 슬라이드 삭제
- `heroService.updateSortOrder()` - 정렬 순서 수정

#### **Image Service (1개)**
- `imageService.deleteImage()` - 이미지 삭제

#### **Auth Service (1개)**
- `authService.getCurrentAdmin()` - 현재 관리자 정보

#### **Core API Client (4개)**
- `apiClient.get()` - GET 요청
- `apiClient.post()` - POST 요청
- `apiClient.put()` - PUT 요청
- `apiClient.delete()` - DELETE 요청

#### **Tenant Management (5개)**
- `adminService.getAllTenants()` - 모든 테넌트 조회
- `adminService.getTenantByCode()` - 코드로 테넌트 조회
- `adminService.getTenantDashboard()` - 테넌트 대시보드
- `adminService.getTenantPlayers()` - 테넌트 선수들
- `adminService.getTenantStadiums()` - 테넌트 구장들
- `adminService.updateTenantSettings()` - 테넌트 설정 수정
- `adminService.createTenant()` - 테넌트 생성
- `adminService.createTeam()` - 팀 생성

## **패턴 분석**
- **CRUD 패턴**: 대부분 Create, Read, Update, Delete 패턴
- **페이징**: 목록 조회에는 page, size 파라미터 
- **필터링**: 상태, 검색어, 팀ID 등으로 필터링
- **계층구조**: Admin > Public > Utility 순서