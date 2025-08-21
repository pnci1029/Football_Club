# Backend 개발 가이드 (Kotlin + Spring Boot)

## 기술 스택
- **언어**: Kotlin 1.9+
- **프레임워크**: Spring Boot 3.x
- **빌드 도구**: Gradle (Kotlin DSL)
- **데이터베이스**: (프로젝트에 따라 결정)
- **JVM**: 17+

## 축구 동호회 특화 프로젝트 구조

```
src/main/kotlin/io/be/
├── BeApplication.kt              # 메인 애플리케이션 클래스
├── config/
│   ├── SubdomainConfig.kt        # 서브도메인 라우팅 설정
│   ├── SecurityConfig.kt         # 관리자 인증 설정
│   └── WebConfig.kt             # CORS, 멀티테넌트 설정
├── controller/
│   ├── admin/                   # 관리자 전용 컨트롤러
│   │   ├── AdminPlayerController.kt
│   │   ├── AdminStadiumController.kt
│   │   └── AdminTeamController.kt
│   ├── public/                  # 공개 API 컨트롤러
│   │   ├── PlayerController.kt
│   │   ├── StadiumController.kt
│   │   └── MatchController.kt
│   └── TeamController.kt        # 팀별 서브도메인 컨트롤러
├── service/
│   ├── PlayerService.kt         # 선수 관리 서비스
│   ├── StadiumService.kt        # 구장 관리 서비스
│   ├── MatchService.kt          # 경기 관리 서비스
│   └── SubdomainService.kt      # 서브도메인 관리 서비스
├── repository/
│   ├── PlayerRepository.kt
│   ├── StadiumRepository.kt
│   ├── MatchRepository.kt
│   └── TeamRepository.kt
├── entity/
│   ├── Player.kt                # 선수 엔티티
│   ├── Stadium.kt               # 구장 엔티티
│   ├── Match.kt                 # 경기 엔티티
│   └── Team.kt                  # 팀 엔티티
├── dto/
│   ├── PlayerDto.kt
│   ├── StadiumDto.kt
│   └── MatchDto.kt
├── exception/
└── util/
```

## 코딩 컨벤션

### 네이밍
- **클래스**: PascalCase (예: `UserService`)
- **함수/변수**: camelCase (예: `findUserById`)
- **상수**: UPPER_SNAKE_CASE (예: `MAX_RETRY_COUNT`)
- **패키지**: 소문자 (예: `io.be.service`)

### Kotlin 스타일
```kotlin
// 데이터 클래스 사용
data class UserDto(
    val id: Long,
    val name: String,
    val email: String
)

// 확장 함수 활용
fun String.isValidEmail(): Boolean = 
    this.matches(Regex("^[A-Za-z0-9+_.-]+@([A-Za-z0-9.-]+\\.[A-Za-z]{2,})$"))

// null 안전성
fun findUser(id: Long): UserDto? = userRepository.findById(id)?.toDto()
```

## Spring Boot 설정

### application.properties 예시
```properties
# 서버 설정
server.port=8080
server.servlet.context-path=/api

# 서브도메인 설정
app.subdomain.enabled=true
app.subdomain.pattern={team}.footballclub.com
app.admin.subdomain=admin.footballclub.com

# 데이터베이스 설정
spring.datasource.url=jdbc:h2:mem:footballclub
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# JPA 설정
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect

# 파일 업로드 설정 (선수 사진용)
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=5MB
app.upload.path=/uploads/players

# 로깅 설정
logging.level.io.be=DEBUG
logging.pattern.console=%d{yyyy-MM-dd HH:mm:ss} - %msg%n
```

## API 경로 규칙

모든 백엔드 API는 반드시 `/api` 접두사로 시작해야 합니다.

**경로 구조:**
- 공개 API: `/api/v1/{resource}` (예: `/api/v1/players`, `/api/v1/stadiums`)
- 관리자 API: `/api/admin/{resource}` (예: `/api/admin/players`, `/api/admin/teams`)
- context-path가 `/api`로 설정되어 있으므로 실제 접근 경로는 자동으로 `/api`가 접두사로 붙습니다.

**컨트롤러에서의 @RequestMapping:**
- 공개 API: `@RequestMapping("/v1/players")` → 실제 경로: `/api/v1/players`
- 관리자 API: `@RequestMapping("/admin/players")` → 실제 경로: `/api/admin/players`

## Controller 패턴

```kotlin
@RestController
@RequestMapping("/v1/users")  // context-path /api가 자동 추가되어 /api/v1/users가 됨
@Validated
class UserController(
    private val userService: UserService
) {
    
    @GetMapping
    fun getUsers(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int
    ): ResponseEntity<ApiResponse<Page<UserDto>>> {
        val users = userService.findUsers(PageRequest.of(page, size))
        return ResponseEntity.ok(ApiResponse.success(users))
    }
    
    @PostMapping
    fun createUser(
        @Valid @RequestBody request: CreateUserRequest
    ): ResponseEntity<ApiResponse<UserDto>> {
        val user = userService.createUser(request)
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(user))
    }
    
    @GetMapping("/{id}")
    fun getUser(@PathVariable id: Long): ResponseEntity<ApiResponse<UserDto>> {
        val user = userService.findUserById(id)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(ApiResponse.success(user))
    }
}
```

## Service 계층

```kotlin
@Service
@Transactional(readOnly = true)
class UserService(
    private val userRepository: UserRepository
) {
    
    @Transactional
    fun createUser(request: CreateUserRequest): UserDto {
        val user = User(
            name = request.name,
            email = request.email
        )
        val savedUser = userRepository.save(user)
        return savedUser.toDto()
    }
    
    fun findUserById(id: Long): UserDto? {
        return userRepository.findById(id).orElse(null)?.toDto()
    }
    
    fun findUsers(pageable: Pageable): Page<UserDto> {
        return userRepository.findAll(pageable).map { it.toDto() }
    }
}
```

## Entity 설계

```kotlin
@Entity
@Table(name = "users")
data class User(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    
    @Column(nullable = false, length = 100)
    val name: String,
    
    @Column(nullable = false, unique = true, length = 255)
    val email: String,
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    val updatedAt: LocalDateTime = LocalDateTime.now()
) {
    fun toDto(): UserDto = UserDto(
        id = id,
        name = name,
        email = email
    )
}
```

## 예외 처리

```kotlin
// 커스텀 예외
class UserNotFoundException(id: Long) : RuntimeException("User not found with id: $id")

// 글로벌 예외 핸들러
@RestControllerAdvice
class GlobalExceptionHandler {
    
    @ExceptionHandler(UserNotFoundException::class)
    fun handleUserNotFound(ex: UserNotFoundException): ResponseEntity<ApiResponse<Nothing>> {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiResponse.error("USER_NOT_FOUND", ex.message))
    }
    
    @ExceptionHandler(ValidationException::class)
    fun handleValidation(ex: ValidationException): ResponseEntity<ApiResponse<Nothing>> {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.error("VALIDATION_ERROR", ex.message))
    }
}
```

## 테스트

### 단위 테스트
```kotlin
@ExtendWith(MockitoExtension::class)
class UserServiceTest {
    
    @Mock
    lateinit var userRepository: UserRepository
    
    @InjectMocks
    lateinit var userService: UserService
    
    @Test
    fun `사용자 생성 성공`() {
        // given
        val request = CreateUserRequest("John", "john@example.com")
        val user = User(1L, "John", "john@example.com")
        
        whenever(userRepository.save(any())).thenReturn(user)
        
        // when
        val result = userService.createUser(request)
        
        // then
        assertThat(result.id).isEqualTo(1L)
        assertThat(result.name).isEqualTo("John")
    }
}
```

### 통합 테스트
- `@SpringBootTest` 활용
- MockMvc를 통한 API 테스트
- 테스트 전용 설정 파일 사용

## 보안 고려사항
축구 동호회 특화 보안 설정 예시는 다음 경로를 참조:
- `be/src/main/kotlin/io/be/config/SecurityConfig.kt`
- `be/src/main/kotlin/io/be/config/WebConfig.kt`

## 성능 최적화
축구 동호회 특화 성능 최적화 예시는 기존 코드베이스의 JPA 설정을 참조하세요.

### 축구 동호회 특화 백엔드 기능

#### 주요 구현 파일들
- **엔티티**: `be/src/main/kotlin/io/be/entity/`
  - `Player.kt` - 선수 정보 엔티티
  - `Team.kt` - 팀 정보 엔티티  
  - `Stadium.kt` - 구장 정보 엔티티

- **서브도메인 처리**: `be/src/main/kotlin/io/be/config/SubdomainConfig.kt`
- **API 컨트롤러**: `be/src/main/kotlin/io/be/controller/public/PlayerController.kt`
- **서비스 레이어**: `be/src/main/kotlin/io/be/service/SubdomainService.kt`
- **유틸리티**: `be/src/main/kotlin/io/be/util/ApiResponse.kt`

#### 구현된 주요 기능
1. **서브도메인 기반 멀티테넌시**: 팀별 서브도메인 인식 및 처리
2. **선수 관리 시스템**: CRUD 작업 및 이미지 업로드 지원
3. **구장 정보 관리**: 위치정보, 시설정보, 요금정보 포함
4. **API 응답 표준화**: 일관된 응답 형식 제공

##### 백엔드 개발 워크플로우 (작업순서)

### 1단계: 프로젝트 설정 및 환경 구성
1. **Kotlin + Spring Boot 프로젝트 초기화**
   - Gradle (Kotlin DSL) 설정
   - 필요 의존성 추가 (Spring Web, JPA, H2/MySQL 등)
   - application.properties 기본 설정

2. **패키지 구조 생성**
   ```
   io.be/
   ├── config/          # 설정 클래스들
   ├── controller/      # REST 컨트롤러
   ├── service/         # 비즈니스 로직
   ├── repository/      # 데이터 접근 계층
   ├── entity/          # JPA 엔티티
   ├── dto/             # 데이터 전송 객체
   ├── exception/       # 예외 처리
   └── util/           # 유틸리티
   ```

### 2단계: 핵심 엔티티 및 데이터 모델 구현
1. **엔티티 설계 및 구현**
   - `Team.kt` - 팀 정보 엔티티
   - `Player.kt` - 선수 정보 엔티티
   - `Stadium.kt` - 구장 정보 엔티티
   - `Match.kt` - 경기 정보 엔티티

2. **Repository 인터페이스 생성**
   - Spring Data JPA 활용
   - 커스텀 쿼리 메서드 정의

### 3단계: 서브도메인 및 멀티테넌시 구현
1. **서브도메인 처리 로직**
   - `SubdomainConfig.kt` - 서브도메인 라우팅
   - `SubdomainService.kt` - 팀별 데이터 분리

2. **팀별 데이터 격리**
   - JPA에서 팀별 데이터 필터링
   - 서브도메인 기반 자동 팀 식별

### 4단계: API 컨트롤러 구현 (우선순위별)
1. **최우선: 선수 관리 API**
   - `PlayerController.kt` - 공개 API
   - `AdminPlayerController.kt` - 관리자 API
   - 선수 CRUD, 이미지 업로드

2. **중우선: 구장 정보 API**
   - `StadiumController.kt` - 구장 정보 조회
   - 위치정보, 시설정보 제공

3. **저우선: 경기 관리 API**
   - `MatchController.kt` - 경기 일정 관리
   - 대결 신청, 예약 시스템

### 5단계: 보안 및 인증 구현
1. **관리자 인증 시스템**
   - `SecurityConfig.kt` - Spring Security 설정
   - JWT 토큰 기반 인증 (선택사항)

2. **CORS 및 도메인 설정**
   - `WebConfig.kt` - CORS 허용 설정
   - 프론트엔드와의 통신 허용

### 6단계: 파일 업로드 및 이미지 처리
1. **선수 이미지 업로드**
   - 파일 업로드 컨트롤러
   - 이미지 최적화 및 저장

2. **정적 파일 서빙**
   - 업로드된 이미지 서빙 설정

### 7단계: API 응답 표준화 및 예외 처리
1. **ApiResponse 유틸리티**
   - 일관된 API 응답 형식
   - 성공/실패 응답 표준화

2. **전역 예외 처리**
   - `GlobalExceptionHandler` 구현
   - 사용자 친화적 에러 메시지

### 8단계: 테스트 및 검증
1. **단위 테스트**
   - Service 계층 테스트
   - Repository 테스트

2. **통합 테스트**
   - API 엔드포인트 테스트
   - 서브도메인 처리 테스트

### 9단계: 성능 최적화 및 배포 준비
1. **성능 최적화**
   - JPA N+1 문제 해결
   - 쿼리 최적화

2. **배포 설정**
   - 프로덕션 application.properties
   - 도커 컨테이너화 (선택사항)

### 개발 환경 설정 참고
```properties
# application.properties 기본 설정
server.port=8080
server.servlet.context-path=/api

# 서브도메인 설정
app.subdomain.enabled=true
app.subdomain.pattern={team}.footballclub.com
app.admin.subdomain=admin.footballclub.com

# 파일 업로드 설정 (선수 사진용)
spring.servlet.multipart.max-file-size=5MB
app.upload.path=/uploads/players
```