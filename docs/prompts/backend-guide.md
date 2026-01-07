# 백엔드 개발 가이드

## 기술 스택
- Kotlin + Spring Boot 3.x
- MySQL 8.0+, Redis
- JWT 인증, 멀티테넌트

## 핵심 원칙
- **멀티테넌트**: 서브도메인별 데이터 완전 격리
- **보안**: Host 헤더 검증, JWT 토큰 인증
- **API**: ApiResponse 표준 응답, 예외 처리 시스템
- **쿼리**: QueryDSL 동적 쿼리, teamId 필터링 강제
- **유틸리티**: HttpUtils, AdminSecurityUtils 재사용

## API 경로
- 공개: `/api/v1/{resource}`
- 관리자: `/api/admin/{resource}`

## 핵심 유틸리티

### HttpUtils
- **getClientIpAddress()**: 프록시/로드밸런서 고려한 실제 클라이언트 IP 추출
- **getUserAgent()**: User-Agent 헤더 안전 추출
- **getHeaderSafely()**: 헤더값 예외 안전 추출

### AdminSecurityUtils
- **getAuthorizedTeamId()**: 관리자 권한별 팀 ID 안전 추출 (MASTER/SUBDOMAIN)
- **validateSubdomainAccess()**: 서브도메인 관리자의 자팀 리소스 접근 검증
- **hasAccessToResource()**: 관리자의 특정 리소스 접근 권한 확인

### ImageUploadService (공통 이미지 업로드)
- **upload()**: 업로드 타입별 이미지 파일 저장 (GALLERY, HERO_SLIDES, PROFILE, COMMUNITY)
- **delete()**: 업로드된 파일 삭제
- **getStorageUsage()**: 팀별 저장공간 사용량 조회

**경로 구조**:
```
/images/
├── gallery/{team}/{year}/{month}/
├── hero-slides/{team}/
├── profile/{team}/
└── community/{team}/{year}/
```

## 보안 체크리스트
- [ ] Host 헤더 검증
- [ ] Cross-tenant 접근 방지 
- [ ] JWT 토큰 검증
- [ ] Repository teamId 필터링
- [ ] 사용량 제한 체크
- [ ] 보안 이벤트 로깅