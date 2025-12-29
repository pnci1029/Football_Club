# 🏟️ 팀 홈페이지 종합 강화 계획

## 📋 프로젝트 개요
축구팀 홈페이지를 단순한 정보 제공 사이트에서 **팀 기록과 추억을 체계적으로 관리하는 플랫폼**으로 업그레이드합니다.

### 🎯 핵심 목표
- **팀 히스토리 완전 디지털화**: 모든 경기, 이벤트, 순간들을 기록
- **멀티미디어 아카이브**: 사진/영상으로 팀의 성장 과정 보존
- **데이터 기반 팀 관리**: 통계와 기록을 통한 팀 발전
- **팬/가족 소통 강화**: 팀 활동 공유 및 소통 플랫폼

---

## 🥇 **1순위: 갤러리 & 하이라이트 관리** (1주 소요)

### 📸 갤러리 시스템
**목표**: 팀의 모든 순간을 사진과 영상으로 보존

#### 핵심 기능
- **멀티미디어 업로드**: 사진, 영상 파일 지원
- **카테고리 분류**: 경기, 훈련, 행사, 선수 프로필, 시설, 수상, 기타
- **태그 시스템**: 선수명, 경기일, 이벤트명으로 태그
- **검색/필터링**: 날짜, 카테고리, 태그별 검색
- **권한 관리**: 관리자 업로드, 일반 사용자 조회

#### 🎬 영상 하이라이트 특화 기능
- **자동 썸네일 생성**: 영상 업로드 시 썸네일 자동 추출
- **영상 메타데이터**: 경기명, 득점 시간, 플레이어 태그
- **하이라이트 컬렉션**: 베스트 골, 세이브 등 주제별 모음
- **스트리밍 최적화**: 대용량 영상 청크 스트리밍
- **SNS 공유**: 하이라이트 영상 직접 공유

### 데이터베이스 설계
```sql
-- 갤러리 메인
CREATE TABLE gallery (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    team_id BIGINT NOT NULL,
    team_subdomain VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category ENUM('MATCH','TRAINING','EVENT','PLAYER','FACILITY','ACHIEVEMENT','HIGHLIGHT','ETC'),
    view_count INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 미디어 파일
CREATE TABLE gallery_media (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    gallery_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    original_file_name VARCHAR(255),
    file_path VARCHAR(500) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    media_type ENUM('IMAGE','VIDEO') NOT NULL,
    width INT, height INT, duration INT,
    thumbnail_url VARCHAR(500),
    sort_order INT DEFAULT 0,
    is_cover BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 태그
CREATE TABLE gallery_tag (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    gallery_id BIGINT NOT NULL,
    tag_name VARCHAR(50) NOT NULL,
    UNIQUE KEY uk_gallery_tag (gallery_id, tag_name)
);

-- 하이라이트 특별 메타데이터
CREATE TABLE highlight_metadata (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    gallery_id BIGINT NOT NULL,
    match_id BIGINT,
    play_type ENUM('GOAL','ASSIST','SAVE','TACKLE','CARD') NOT NULL,
    player_names VARCHAR(200),
    game_minute INT,
    description TEXT,
    highlight_rating INT DEFAULT 0,
    FOREIGN KEY (gallery_id) REFERENCES gallery(id),
    FOREIGN KEY (match_id) REFERENCES matches(id)
);
```

---

## 🥈 **2순위: 팀 대시보드 & 통계** (1주 소요)

### 📊 대시보드 위젯 시스템
**목표**: 팀 현황을 한눈에 파악할 수 있는 대시보드

#### 홈페이지 대시보드 위젯
- **다음 경기 카운트다운**: D-Day와 상대팀 정보
- **최근 3경기 결과**: 승부, 스코어, 간단 통계
- **팀 기본 통계**: 시즌 전적, 득실차, 승률
- **이달의 MVP**: 득점왕, 도움왕, 출전왕
- **최신 갤러리**: 최근 업로드된 사진/영상 미리보기
- **커뮤니티 활동**: 최신 글, 인기 글

#### 상세 통계 페이지
- **시즌별 성적**: 년도별 전적 추이
- **선수별 누적 기록**: 출전, 득점, 도움, 경고/퇴장
- **경기 분석**: 홈/어웨이별 성적, 요일/시간대별 승률
- **상대팀 전적**: 팀별 상대 전적
- **월별 활동량**: 경기 수, 훈련 일수, 커뮤니티 활동

### 데이터베이스 설계
```sql
-- 팀 시즌 통계
CREATE TABLE team_season_stats (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    team_id BIGINT NOT NULL,
    season_year INT NOT NULL,
    total_matches INT DEFAULT 0,
    wins INT DEFAULT 0,
    draws INT DEFAULT 0,
    losses INT DEFAULT 0,
    goals_for INT DEFAULT 0,
    goals_against INT DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0.00,
    UNIQUE KEY uk_team_season (team_id, season_year)
);

-- 선수 시즌 통계
CREATE TABLE player_season_stats (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    player_id BIGINT NOT NULL,
    team_id BIGINT NOT NULL,
    season_year INT NOT NULL,
    appearances INT DEFAULT 0,
    goals INT DEFAULT 0,
    assists INT DEFAULT 0,
    yellow_cards INT DEFAULT 0,
    red_cards INT DEFAULT 0,
    minutes_played INT DEFAULT 0,
    UNIQUE KEY uk_player_season (player_id, season_year)
);

-- 대시보드 설정
CREATE TABLE dashboard_widget (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    team_id BIGINT NOT NULL,
    widget_type VARCHAR(50) NOT NULL,
    widget_position INT DEFAULT 0,
    is_visible BOOLEAN DEFAULT TRUE,
    widget_config JSON,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 🥉 **3순위: 경기 기록 고도화** (1주 소요)

### ⚽ 경기 상세 기록 시스템
**목표**: 단순한 스코어를 넘어 경기의 모든 순간을 기록

#### 경기 이벤트 기록
- **득점 기록**: 득점자, 도움, 시간, 골 유형
- **카드 기록**: 경고/퇴장, 선수명, 시간, 사유
- **교체 기록**: IN/OUT 선수, 시간
- **기타 이벤트**: 페널티킥, 코너킥 등

#### 경기 후 리포트
- **경기 평점**: 선수별 개인 평점 (1-10점)
- **MOM 선정**: 경기 최고 선수
- **경기 후기**: 감독/선수 코멘트
- **통계 데이터**: 점유율, 슈팅, 패스 성공률 등
- **사진/영상 연동**: 갤러리와 연동하여 경기별 미디어 자동 분류

### 데이터베이스 설계
```sql
-- 경기 이벤트
CREATE TABLE match_event (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    match_id BIGINT NOT NULL,
    event_type ENUM('GOAL','ASSIST','YELLOW_CARD','RED_CARD','SUBSTITUTION','PENALTY') NOT NULL,
    player_id BIGINT,
    player_name VARCHAR(100),
    assist_player_id BIGINT,
    minute INT NOT NULL,
    additional_time INT DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 경기 선수 평점
CREATE TABLE match_player_rating (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    match_id BIGINT NOT NULL,
    player_id BIGINT NOT NULL,
    player_name VARCHAR(100) NOT NULL,
    rating DECIMAL(3,1),
    is_mom BOOLEAN DEFAULT FALSE,
    comment TEXT,
    UNIQUE KEY uk_match_player (match_id, player_id)
);

-- 경기 상세 통계
CREATE TABLE match_statistics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    match_id BIGINT NOT NULL UNIQUE,
    possession_home DECIMAL(5,2),
    possession_away DECIMAL(5,2),
    shots_home INT DEFAULT 0,
    shots_away INT DEFAULT 0,
    shots_on_target_home INT DEFAULT 0,
    shots_on_target_away INT DEFAULT 0,
    corners_home INT DEFAULT 0,
    corners_away INT DEFAULT 0,
    fouls_home INT DEFAULT 0,
    fouls_away INT DEFAULT 0,
    weather VARCHAR(50),
    attendance INT,
    referee VARCHAR(100)
);

-- 경기 리포트
CREATE TABLE match_report (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    match_id BIGINT NOT NULL UNIQUE,
    pre_match_comment TEXT,
    post_match_comment TEXT,
    coach_comment TEXT,
    match_summary TEXT,
    key_moments TEXT,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🏅 **4순위: 팀 히스토리 & 아카이브** (1주 소요)

### 📜 팀 연혁 관리
**목표**: 팀의 역사와 전통을 디지털로 보존

#### 연혁 기록
- **팀 창단 스토리**: 창단일, 창단 멤버, 창단 취지
- **주요 이정표**: 첫 경기, 첫 승리, 100경기 달성 등
- **시설 변천사**: 홈구장 변화, 시설 개선 내역
- **역대 임원진**: 회장, 감독, 코치 변천사
- **팀 전통**: 응원가, 슬로건, 전통 이벤트

#### 수상 & 성과 기록
- **트로피 케이스**: 우승 트로피, 메달, 상장 등
- **개인 수상**: MVP, 득점왕, 공로상 등
- **기록 달성**: 연속 무패, 최다 득점 등 특별 기록
- **언론 보도**: 신문 기사, 인터뷰, 방송 출연

### 데이터베이스 설계
```sql
-- 팀 연혁
CREATE TABLE team_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    team_id BIGINT NOT NULL,
    event_date DATE NOT NULL,
    event_type ENUM('FOUNDING','MILESTONE','FACILITY','MANAGEMENT','TRADITION','OTHER') NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    importance_level INT DEFAULT 1, -- 1-5 중요도
    related_media_urls JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 수상 기록
CREATE TABLE team_achievement (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    team_id BIGINT NOT NULL,
    achievement_date DATE NOT NULL,
    achievement_type ENUM('CHAMPIONSHIP','TOURNAMENT','INDIVIDUAL','RECORD','RECOGNITION') NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    competition_name VARCHAR(200),
    ranking_position INT, -- 1등, 2등, 3등 등
    recipient_type ENUM('TEAM','PLAYER','STAFF') NOT NULL,
    recipient_id BIGINT, -- player_id or NULL for team
    certificate_image_url VARCHAR(500),
    trophy_image_url VARCHAR(500)
);

-- 언론 보도
CREATE TABLE media_coverage (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    team_id BIGINT NOT NULL,
    publication_date DATE NOT NULL,
    media_type ENUM('NEWSPAPER','MAGAZINE','TV','RADIO','ONLINE') NOT NULL,
    media_name VARCHAR(200) NOT NULL,
    title VARCHAR(300) NOT NULL,
    content TEXT,
    journalist_name VARCHAR(100),
    article_url VARCHAR(500),
    image_url VARCHAR(500)
);
```

---

## 📰 **5순위: 팀 뉴스 & 소식** (4일 소요)

### 📢 팀 공식 뉴스 시스템
**목표**: 관리자가 발행하는 팀 공식 소식 채널

#### 뉴스 카테고리
- **팀 소식**: 선수 영입/이적, 임원진 변경
- **경기 뉴스**: 경기 프리뷰/리뷰, 부상자 현황
- **이벤트**: 팀 행사, 팬미팅, 시즌 정기모임
- **공지사항**: 훈련 일정 변경, 회비 안내
- **언론 보도**: 팀 관련 외부 기사 큐레이션

### 데이터베이스 설계
```sql
-- 팀 뉴스
CREATE TABLE team_news (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    team_id BIGINT NOT NULL,
    team_subdomain VARCHAR(50) NOT NULL,
    category ENUM('TEAM','MATCH','EVENT','NOTICE','MEDIA') NOT NULL,
    title VARCHAR(300) NOT NULL,
    summary VARCHAR(500),
    content TEXT NOT NULL,
    featured_image_url VARCHAR(500),
    is_important BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    view_count INT DEFAULT 0,
    author_name VARCHAR(100),
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 뉴스 태그
CREATE TABLE news_tag (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    news_id BIGINT NOT NULL,
    tag_name VARCHAR(50) NOT NULL,
    UNIQUE KEY uk_news_tag (news_id, tag_name)
);
```

---

## 👤 **6순위: 선수 개인 프로필 고도화** (1주 소요)

### 🏆 선수 개인 기록 시스템
**목표**: 각 선수의 성장 과정과 기록을 상세히 관리

#### 선수 상세 프로필
- **기본 정보 확장**: 생년월일, 출신지, 경력, 특기
- **시즌별 기록**: 년도별 출전/득점/도움 추이 그래프
- **개인 수상 내역**: MVP, 득점왕, 특별상 등
- **성장 스토리**: 입단 계기, 목표, 각오
- **개인 갤러리**: 선수별 전용 사진 모음
- **팬 메시지**: 팬들이 남기는 응원 메시지

#### 선수 비교 기능
- **동 포지션 비교**: 같은 포지션 선수들 간 성과 비교
- **시즌별 성장**: 전년 대비 기록 향상도
- **팀 내 순위**: 득점, 출전, 도움 등 팀 내 랭킹

### 데이터베이스 설계
```sql
-- 선수 상세 프로필
CREATE TABLE player_profile_extended (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    player_id BIGINT NOT NULL UNIQUE,
    birth_date DATE,
    hometown VARCHAR(100),
    career_summary TEXT,
    specialty TEXT,
    join_story TEXT,
    personal_goal TEXT,
    motto VARCHAR(200),
    hobby VARCHAR(200),
    favorite_player VARCHAR(100),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 선수 개인 수상
CREATE TABLE player_achievement (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    player_id BIGINT NOT NULL,
    achievement_date DATE NOT NULL,
    achievement_type VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    season_year INT,
    certificate_image_url VARCHAR(500)
);

-- 팬 메시지
CREATE TABLE fan_message (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    player_id BIGINT NOT NULL,
    fan_name VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🛠️ 기술 구현 전략

### Backend 아키텍처
```
be/src/main/kotlin/io/be/
├── gallery/
│   ├── domain/
│   ├── application/
│   └── presentation/
├── dashboard/
│   ├── domain/
│   ├── application/
│   └── presentation/
├── match-record/
│   ├── domain/
│   ├── application/
│   └── presentation/
├── team-history/
│   ├── domain/
│   ├── application/
│   └── presentation/
├── team-news/
│   ├── domain/
│   ├── application/
│   └── presentation/
└── player-profile/
    ├── domain/
    ├── application/
    └── presentation/
```

### Frontend 컴포넌트 구조
```
fe/src/
├── pages/
│   ├── Gallery.tsx
│   ├── Dashboard.tsx
│   ├── MatchRecord.tsx
│   ├── TeamHistory.tsx
│   ├── TeamNews.tsx
│   └── PlayerProfile.tsx
├── components/
│   ├── gallery/
│   ├── dashboard/
│   ├── match-record/
│   ├── team-history/
│   ├── team-news/
│   └── player-profile/
└── hooks/
    ├── useGallery.ts
    ├── useDashboard.ts
    ├── useMatchRecord.ts
    ├── useTeamHistory.ts
    ├── useTeamNews.ts
    └── usePlayerProfile.ts
```

### API 엔드포인트 설계
```
# Public APIs
GET    /api/v1/gallery
GET    /api/v1/dashboard/stats
GET    /api/v1/matches/{id}/detail
GET    /api/v1/team/history
GET    /api/v1/news
GET    /api/v1/players/{id}/profile

# Admin APIs  
POST   /api/v1/admin/gallery
POST   /api/v1/admin/match-events
POST   /api/v1/admin/team-history
POST   /api/v1/admin/news
PUT    /api/v1/admin/player-profile/{id}
```

---

## 📅 전체 개발 로드맵

### **Week 1: 갤러리 & 하이라이트 (1순위)**
- Day 1-2: DB 설계 + Entity/Repository 구현
- Day 3-4: Gallery Service + Admin API 구현  
- Day 5-7: Frontend 갤러리 페이지 + 업로드 기능

### **Week 2: 대시보드 & 통계 (2순위)**
- Day 1-2: 통계 DB + Service 구현
- Day 3-4: Dashboard API + 위젯 시스템
- Day 5-7: Frontend 대시보드 위젯들

### **Week 3: 경기 기록 고도화 (3순위)**  
- Day 1-2: 경기 이벤트 DB + Service
- Day 3-4: 경기 상세 기록 API
- Day 5-7: Frontend 경기 상세 페이지

### **Week 4: 팀 히스토리 & 아카이브 (4순위)**
- Day 1-2: 연혁/수상 DB + Service  
- Day 3-4: 히스토리 API + 관리 기능
- Day 5-7: Frontend 히스토리 페이지

### **Week 5: 추가 기능들 (5-6순위)**
- Day 1-3: 팀 뉴스 시스템
- Day 4-7: 선수 프로필 고도화

---

## 🎯 성공 지표

### 정량적 지표
- **갤러리 업로드**: 월 50개 이상 미디어 업로드
- **하이라이트 조회**: 영상 평균 조회수 100회 이상
- **대시보드 사용**: 일일 대시보드 방문 80% 이상
- **기록 완성도**: 경기별 상세 기록 작성률 90% 이상

### 정성적 지표
- **사용자 만족도**: 팀원 만족도 4.5/5.0 이상
- **아카이브 가치**: 팀 역사 보존 완성도
- **소통 활성화**: 팀 내 소통 및 참여도 증가

---

**최종 목표**: 단순한 팀 홈페이지를 넘어 **팀의 모든 순간과 기록을 보존하는 디지털 아카이브**로 발전시키기

**우선순위**: 갤러리/하이라이트 → 대시보드 → 경기기록 → 히스토리 → 뉴스 → 선수프로필

**예상 완성 기간**: 5-6주  
**작성일**: 2024-12-29  
**상태**: 백엔드 구현 준비 완료