# Backend Architecture Guide

## 패키지 구조 변경 (레이어형 → 도메인형)

### 변경 이유
- **파일 찾기 어려움**: repository 패키지에만 30개 파일 존재
- **관련 파일 분산**: 하나의 기능 수정 시 7개 다른 폴더를 왔다갔다
- **개발 생산성 저하**: IDE에서 연관 파일 찾기 어려움
- **코드 리뷰 불편**: 기능별 구조 파악 힘듦

### 기존 구조 (Layered Architecture)
```
src/main/kotlin/io/be/
├── entity/           # 모든 엔티티 (10개)
├── repository/       # 모든 리포지토리 (30개)
├── service/          # 모든 서비스 (16개)
├── controller/       # 모든 컨트롤러 (14개)
└── dto/             # 모든 DTO (10개)
```

### 새 구조 (Domain-Driven Design)
```
src/main/kotlin/io/be/
├── notice/              # 공지사항 도메인
│   ├── domain/
│   │   ├── Notice.kt
│   │   ├── NoticeComment.kt
│   │   ├── NoticeRepository.kt
│   │   ├── NoticeRepositoryCustom.kt
│   │   ├── NoticeRepositoryImpl.kt
│   │   ├── NoticeCommentRepository.kt
│   │   ├── NoticeCommentRepositoryCustom.kt
│   │   └── NoticeCommentRepositoryImpl.kt
│   ├── application/
│   │   ├── NoticeService.kt
│   │   └── AllNoticeService.kt
│   ├── presentation/
│   │   └── NoticeController.kt
│   └── dto/
│       ├── NoticeRequest.kt
│       ├── NoticeResponse.kt
│       └── AllNoticeResponse.kt
├── community/           # 커뮤니티 도메인
│   ├── domain/
│   ├── application/
│   ├── presentation/
│   └── dto/
├── team/               # 팀 도메인
├── player/             # 선수 도메인
├── match/              # 경기 도메인
├── stadium/            # 경기장 도메인
├── admin/              # 관리자 도메인
└── shared/             # 공통 기능
    ├── config/
    ├── security/
    ├── util/
    ├── exception/
    ├── aspect/
    ├── filter/
    └── base/
        └── BaseQueryRepository.kt
```

## 리팩토링 진행 순서

### Phase 1: Notice 도메인 (우선순위 높음)
- 가장 복잡하고 파일이 많은 도메인
- NoticeRepository, NoticeCommentRepository 및 관련 파일들
- NoticeService, AllNoticeService
- NoticeController

### Phase 2: Community 도메인
- CommunityPostRepository, CommunityCommentRepository
- CommunityService, AllCommunityService
- CommunityController

### Phase 3: 나머지 도메인들
- Team, Player, Match, Stadium, Admin 순서로 진행

### Phase 4: Shared 패키지 정리
- 공통 설정, 유틸리티, 보안 관련 파일들

## 리팩토링 원칙

### 1. 점진적 변경
- 한 번에 모든 것을 바꾸지 않고 도메인별로 순차 진행
- 각 단계마다 컴파일 및 테스트 확인

### 2. 의존성 최소화
- 도메인 간 직접 참조 최소화
- 필요시 인터페이스를 통한 느슨한 결합

### 3. 공통 기능 분리
- BaseQueryRepository 같은 공통 기능은 shared 패키지로
- 설정, 보안, 유틸리티는 shared에서 관리

### 4. 패키지 명명 규칙
- 도메인명은 단수형 사용 (notice, team, player)
- 하위 패키지는 역할별로 명확히 구분 (domain, application, presentation, dto)

## 기대 효과

### 1. 개발 생산성 향상
- 관련 파일들이 한 곳에 모여 있어 탐색 시간 단축
- 새로운 기능 추가 시 구조가 명확

### 2. 코드 유지보수성 개선
- 도메인별 응집도 증가
- 변경 영향 범위 최소화

### 3. 팀 협업 효율성
- 도메인별 작업 분담 명확
- 코드 리뷰 시 맥락 파악 용이

### 4. 확장성 확보
- 새로운 도메인 추가 용이
- 마이크로서비스 전환 시 유리

## 주의사항

### 1. Import 경로 변경
- 모든 import 문 수정 필요
- IDE의 refactoring 기능 적극 활용

### 2. 테스트 코드 동기화
- 패키지 구조 변경에 따른 테스트 코드 수정
- 테스트 패키지 구조도 동일하게 변경

### 3. 빌드 설정 확인
- Gradle 설정에서 패키지 참조 확인
- QueryDSL Q클래스 생성 경로 확인

## 완료 기준

- [ ] Notice 도메인 리팩토링 완료
- [ ] Community 도메인 리팩토링 완료  
- [ ] Team 도메인 리팩토링 완료
- [ ] Player 도메인 리팩토링 완료
- [ ] Match 도메인 리팩토링 완료
- [ ] Stadium 도메인 리팩토링 완료
- [ ] Admin 도메인 리팩토링 완료
- [ ] Shared 패키지 정리 완료
- [ ] 모든 테스트 통과
- [ ] 빌드 성공 확인