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

### 🎯 1단계: 핵심 컨트롤러 구현 ✅ **완료**
1. **TeamController.kt** - 팀별 서브도메인 컨트롤러 ✅
   - 팀 정보 조회 API (`/v1/team/info`)
   - 팀별 선수/경기/구장 조회 API (스텁 구현)
   - 서브도메인 기반 자동 팀 식별

2. **MatchController.kt를 public 패키지로 이동** ✅
   - `be/src/main/kotlin/io/be/controller/MatchController.kt` → `be/src/main/kotlin/io/be/controller/public/MatchController.kt`
   - 패키지 경로 수정

### 🔒 2단계: 보안 및 설정 인프라 ✅ **완료**
1. **SecurityConfig.kt** - 관리자 인증 설정 ✅
   - Spring Security 설정 확장
   - CORS 설정 통합
   - H2 콘솔 허용 (개발용)
   - 관리자 API 보안 설정

2. **WebConfig.kt** - CORS, 멀티테넌트 설정 ✅
   - 서브도메인 인터셉터 추가
   - CORS 정책 확장
   - 팀별 요청 검증 로직

3. **SubdomainConfig.kt** - 서브도메인 라우팅 설정 ✅
   - Configuration Properties 추가
   - 로컬/프로덕션 환경별 서브도메인 처리
   - 기존 SubdomainResolver와 통합

### 🏢 관리자 대시보드 강화 ✅ **완료**
1. **AdminTeamController.kt** - 구단별 통계 API ✅
   - `GET /v1/admin/teams/dashboard-stats` - 전체 대시보드 통계
   - `GET /v1/admin/teams/{teamId}/stats` - 특정 팀 통계
   - 팀별 선수/구장 개수 집계

2. **AdminPlayerController.kt** - 구단별 선수 필터링 ✅
   - `teamId` 파라미터로 구단별 선수 조회
   - 필수 팀 ID 검증 로직

3. **AdminStadiumController.kt** - 구단별 구장 필터링 ✅
   - `teamId` 파라미터로 구단별 구장 조회 추가
   - 전체 구장 조회와 팀별 구장 조회 분리

4. **TeamService.kt** - 통계 집계 서비스 ✅
   - `getTeamStats(teamId)` - 개별 팀 통계
   - `getAllTeamsStats()` - 전체 팀 통계
   - PlayerRepository, StadiumRepository 의존성 주입

### 🚨 3단계: 예외 처리 시스템 📋 **다음 작업**
1. **CustomExceptions.kt** 구현 필요
   ```kotlin
   // 팀 관련 예외
   class TeamNotFoundException(id: Long) : RuntimeException("Team not found with id: $id")
   class TeamCodeAlreadyExistsException(code: String) : RuntimeException("Team code already exists: $code")
   
   // 선수 관련 예외
   class PlayerNotFoundException(id: Long) : RuntimeException("Player not found with id: $id")
   class PlayerAlreadyExistsException(name: String, teamId: Long) : RuntimeException("Player already exists: $name in team $teamId")
   
   // 구장 관련 예외
   class StadiumNotFoundException(id: Long) : RuntimeException("Stadium not found with id: $id")
   class StadiumBookingConflictException(message: String) : RuntimeException(message)
   
   // 경기 관련 예외
   class MatchNotFoundException(id: Long) : RuntimeException("Match not found with id: $id")
   class InvalidMatchStatusException(message: String) : RuntimeException(message)
   
   // 서브도메인 관련 예외
   class InvalidSubdomainException(subdomain: String) : RuntimeException("Invalid subdomain: $subdomain")
   class SubdomainAccessDeniedException(message: String) : RuntimeException(message)
   
   // 파일 업로드 관련 예외
   class FileUploadException(message: String) : RuntimeException(message)
   class UnsupportedFileTypeException(fileType: String) : RuntimeException("Unsupported file type: $fileType")
   ```

2. **GlobalExceptionHandler.kt** 구현 필요
   ```kotlin
   @RestControllerAdvice
   class GlobalExceptionHandler {
       
       // 팀 관련 예외 처리
       @ExceptionHandler(TeamNotFoundException::class)
       fun handleTeamNotFound(ex: TeamNotFoundException): ResponseEntity<ApiResponse<Nothing>>
       
       // 선수 관련 예외 처리
       @ExceptionHandler(PlayerNotFoundException::class)
       fun handlePlayerNotFound(ex: PlayerNotFoundException): ResponseEntity<ApiResponse<Nothing>>
       
       // 구장 관련 예외 처리
       @ExceptionHandler(StadiumNotFoundException::class)
       fun handleStadiumNotFound(ex: StadiumNotFoundException): ResponseEntity<ApiResponse<Nothing>>
       
       // 경기 관련 예외 처리
       @ExceptionHandler(MatchNotFoundException::class)
       fun handleMatchNotFound(ex: MatchNotFoundException): ResponseEntity<ApiResponse<Nothing>>
       
       // 서브도메인 관련 예외 처리
       @ExceptionHandler(InvalidSubdomainException::class)
       fun handleInvalidSubdomain(ex: InvalidSubdomainException): ResponseEntity<ApiResponse<Nothing>>
       
       // 파일 업로드 관련 예외 처리
       @ExceptionHandler(FileUploadException::class)
       fun handleFileUpload(ex: FileUploadException): ResponseEntity<ApiResponse<Nothing>>
       
       // Spring Validation 예외 처리
       @ExceptionHandler(MethodArgumentNotValidException::class)
       fun handleValidation(ex: MethodArgumentNotValidException): ResponseEntity<ApiResponse<Nothing>>
       
       // 일반 예외 처리
       @ExceptionHandler(Exception::class)
       fun handleGeneral(ex: Exception): ResponseEntity<ApiResponse<Nothing>>
   }
   ```

### 🛠️ 4단계: 유틸리티 및 API 표준화 📋 **다음 작업**
1. **ApiResponse.kt** 구현 필요
   ```kotlin
   data class ApiResponse<T>(
       val success: Boolean,
       val data: T? = null,
       val errorCode: String? = null,
       val message: String? = null,
       val timestamp: String = LocalDateTime.now().toString()
   ) {
       companion object {
           fun <T> success(data: T): ApiResponse<T> = ApiResponse(true, data)
           
           fun <T> error(errorCode: String, message: String?): ApiResponse<T> = 
               ApiResponse(false, null, errorCode, message)
               
           fun <T> error(message: String): ApiResponse<T> = 
               ApiResponse(false, null, "INTERNAL_ERROR", message)
       }
   }
   ```

### 📁 5단계: 파일 업로드 시스템 📋 **다음 작업**
1. **FileUploadController.kt** 구현 필요
   - 선수 이미지 업로드 API (`/v1/upload/player-image`)
   - 팀 로고 업로드 API (`/v1/upload/team-logo`)
   - 파일 크기/형식 검증
   - 이미지 최적화 및 저장

2. **FileService.kt** 구현 필요
   - 파일 저장 로직
   - 이미지 리사이징
   - 파일 삭제 기능
   - 정적 파일 서빙 설정

### 🔧 6단계: 고급 기능 및 최적화 📋 **다음 작업**
1. **JWT 토큰 기반 인증 시스템** (선택사항)
   - JwtTokenProvider 구현
   - JWT 필터 추가
   - 리프레시 토큰 처리

2. **서브도메인 기반 멀티테넌시 로직 강화**
   - 팀별 데이터 격리 필터링
   - JPA에서 자동 팀 필터링
   - 팀별 성능 최적화

3. **성능 최적화**
   - JPA N+1 문제 해결
   - 쿼리 최적화
   - 캐싱 전략 구현

### 📋 **현재 구현 상태 요약**
- ✅ **1단계 완료**: TeamController, MatchController 이동
- ✅ **2단계 완료**: SecurityConfig, WebConfig, SubdomainConfig 
- 🔄 **3단계 대기**: CustomExceptions, GlobalExceptionHandler
- 📋 **4단계 대기**: ApiResponse 유틸리티
- 📋 **5단계 대기**: 파일 업로드 시스템
- 📋 **6단계 대기**: 고급 기능 및 최적화

### 📝 **다음 단계 실행 명령**
```bash
# 3단계 실행
claude "3단계 예외 처리 시스템을 구현해주세요"

# 4단계 실행  
claude "4단계 ApiResponse 유틸리티를 구현해주세요"

# 5단계 실행
claude "5단계 파일 업로드 시스템을 구현해주세요"
```

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