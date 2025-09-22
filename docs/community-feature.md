# 커뮤니티 기능 개발 문서

## 개요
축구클럽 사용자 페이지에 커뮤니티 기능을 추가하여 외부 팀과의 경기 문의 및 소통이 가능하도록 구현했습니다.

## 기능 요구사항

### 기본 기능
- **게시글 작성/조회**: 제목, 내용, 작성자명, 연락처(이메일/전화번호) 입력
- **댓글 시스템**: 게시글에 대한 댓글 작성/삭제
- **검색 기능**: 제목, 내용 기준으로 검색
- **페이지네이션**: 게시글 목록 페이징 처리
- **멀티테넌트 지원**: 각 팀별로 완전히 분리된 커뮤니티

### 사용 사례
- 경기 문의: "9/27일 토요일 오전에 같이 찰 수 있을까요? 저희팀은 9명 있고 2명만 빌려주세요."
- 팀 교류: 타 팀과의 친선경기 제안
- 기타 축구 관련 소통

## 기술 구조

### 백엔드 (Kotlin + Spring Boot)

#### 데이터베이스 모델

**CommunityPost (게시글)**
```kotlin
@Entity
@Table(name = "community_posts")
data class CommunityPost(
    val id: Long = 0,
    val title: String,                // 제목 (최대 200자)
    val content: String,              // 내용 (최대 10,000자)
    val authorName: String,           // 작성자명 (최대 50자)
    val authorEmail: String? = null,  // 작성자 이메일 (선택)
    val authorPhone: String? = null,  // 작성자 전화번호 (선택)
    val teamSubdomain: String,        // 멀티테넌트 구분용
    val viewCount: Int = 0,           // 조회수
    val isNotice: Boolean = false,    // 공지사항 여부
    val isActive: Boolean = true,     // 활성화 여부 (soft delete)
    val createdAt: LocalDateTime,     // 생성일시
    val updatedAt: LocalDateTime      // 수정일시
)
```

**CommunityComment (댓글)**
```kotlin
@Entity
@Table(name = "community_comments")
data class CommunityComment(
    val id: Long = 0,
    val post: CommunityPost,          // 연관 게시글
    val content: String,              // 댓글 내용 (최대 1,000자)
    val authorName: String,           // 작성자명 (최대 50자)
    val authorEmail: String? = null,  // 작성자 이메일 (선택)
    val isActive: Boolean = true,     // 활성화 여부 (soft delete)
    val createdAt: LocalDateTime,     // 생성일시
    val updatedAt: LocalDateTime      // 수정일시
)
```

#### API 엔드포인트

**게시글 관련**
- `GET /api/v1/community/posts` - 게시글 목록 조회 (페이징, 검색)
- `GET /api/v1/community/posts/{postId}` - 게시글 상세 조회
- `POST /api/v1/community/posts` - 게시글 작성
- `PUT /api/v1/community/posts/{postId}` - 게시글 수정
- `DELETE /api/v1/community/posts/{postId}` - 게시글 삭제 (비활성화)

**댓글 관련**
- `POST /api/v1/community/posts/{postId}/comments` - 댓글 작성
- `DELETE /api/v1/community/comments/{commentId}` - 댓글 삭제 (비활성화)

#### 멀티테넌트 보안
- 모든 API에서 `teamSubdomain`으로 데이터 필터링
- 서브도메인 추출을 통한 자동 팀 구분
- 타 팀 데이터 접근 완전 차단

### 프론트엔드 (React + TypeScript)

#### 페이지 구조
- **커뮤니티 메인**: `/community` - 게시글 목록, 검색, 페이지네이션
- **게시글 상세**: `/community/{postId}` - 게시글 내용, 댓글 목록

#### 컴포넌트
- `Community.tsx` - 메인 커뮤니티 페이지
- `communityApi` - API 통신 모듈
- Navigation 드롭다운 메뉴 - 경기 > 커뮤니티

#### 주요 기능
- 반응형 디자인 (모바일 최적화)
- 실시간 검색
- 무한 스크롤 또는 페이지네이션
- 조회수 자동 증가
- 댓글 CRUD

## 사용자 인터페이스

### 메인 페이지
- 헤더: 커뮤니티 제목, 글쓰기 버튼, 검색창
- 게시글 목록: 제목, 내용 미리보기, 작성자, 날짜, 조회수, 댓글수
- 페이지네이션

### 게시글 상세
- 게시글 내용 전체 표시
- 작성자 연락처 정보 (이메일, 전화번호)
- 댓글 목록 및 작성 폼

## 설치 및 설정

### 데이터베이스 마이그레이션
```sql
-- 게시글 테이블
CREATE TABLE community_posts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    author_name VARCHAR(50) NOT NULL,
    author_email VARCHAR(100),
    author_phone VARCHAR(20),
    team_subdomain VARCHAR(50) NOT NULL,
    view_count INT DEFAULT 0,
    is_notice BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 댓글 테이블
CREATE TABLE community_comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    author_name VARCHAR(50) NOT NULL,
    author_email VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES community_posts(id)
);

-- 인덱스 생성
CREATE INDEX idx_community_posts_team_subdomain ON community_posts(team_subdomain);
CREATE INDEX idx_community_posts_created_at ON community_posts(created_at);
CREATE INDEX idx_community_comments_post_id ON community_comments(post_id);
```

### 프론트엔드 라우팅
```typescript
// App.tsx에 라우트 추가
<Route path="/community" element={<Community />} />
```

### 네비게이션 메뉴
```typescript
// Navigation.tsx 메뉴 구조
{ 
  name: '경기', 
  href: '/matches', 
  submenu: [
    { name: '경기 일정', href: '/matches' },
    { name: '커뮤니티', href: '/community' }
  ]
}
```

## 보안 고려사항

### 멀티테넌트 보안
- 서브도메인 기반 데이터 격리
- API 레벨에서 `teamSubdomain` 필터링 강제
- 직접적인 ID 접근 방지

### 입력 검증
- 클라이언트/서버 양쪽 유효성 검사
- XSS 방지를 위한 HTML 이스케이핑
- SQL 인젝션 방지 (JPA 사용)

### 스팸 방지
- 게시글/댓글 길이 제한
- Rate limiting (향후 구현 예정)
- 신고 기능 (향후 구현 예정)

## 향후 개선 계획

### 기능 확장
- [ ] 이미지 첨부 기능
- [ ] 게시글 카테고리 분류
- [ ] 공지사항 상단 고정
- [ ] 작성자 인증 시스템
- [ ] 답글(대댓글) 기능

### 성능 최적화
- [ ] 게시글 캐싱
- [ ] 이미지 최적화
- [ ] 무한 스크롤
- [ ] 검색 인덱싱

### 관리 기능
- [ ] 관리자 게시글 관리
- [ ] 부적절한 게시글 신고/삭제
- [ ] 사용자 차단 기능
- [ ] 통계 대시보드

## 파일 구조

### 백엔드
```
be/src/main/kotlin/io/be/
├── entity/Community.kt              # 엔티티 정의
├── repository/CommunityRepository.kt # 레포지토리
├── service/CommunityService.kt      # 비즈니스 로직
└── controller/CommunityController.kt # REST API
```

### 프론트엔드
```
fe/src/
├── pages/Community.tsx              # 메인 커뮤니티 페이지
├── api/modules/community.ts         # API 통신 모듈
├── components/layout/Navigation.tsx # 네비게이션 (수정)
└── api/endpoints.ts                 # API 엔드포인트 (수정)
```

## 테스트

### API 테스트
```bash
# 게시글 목록 조회
curl "http://team1.localhost:3000/api/v1/community/posts?page=0&size=20"

# 게시글 작성
curl -X POST "http://team1.localhost:3000/api/v1/community/posts" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "경기 희망합니다",
    "content": "9/27일 토요일 오전에 같이 찰 수 있을까요?",
    "authorName": "홍길동",
    "authorEmail": "hong@example.com",
    "authorPhone": "010-1234-5678"
  }'
```

### 프론트엔드 테스트
1. `http://team1.localhost:3000/community` 접속
2. 게시글 목록 확인
3. 검색 기능 테스트
4. 글쓰기 기능 테스트

---

**개발 완료일**: 2025년 1월 16일  
**개발자**: Claude Code Assistant  
**버전**: 1.0.0