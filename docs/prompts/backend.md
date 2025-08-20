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

## Controller 패턴

```kotlin
@RestController
@RequestMapping("/api/v1/users")
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
```kotlin
@SpringBootTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@TestPropertySource(locations = ["classpath:application-test.properties"])
class UserControllerIntegrationTest {
    
    @Autowired
    lateinit var mockMvc: MockMvc
    
    @Test
    fun `사용자 목록 조회`() {
        mockMvc.get("/api/v1/users")
            .andExpect(status().isOk)
            .andExpected(jsonPath("$.success").value(true))
    }
}
```

## 보안 고려사항

### 입력 검증
```kotlin
data class CreateUserRequest(
    @field:NotBlank(message = "이름은 필수입니다")
    @field:Size(min = 2, max = 50, message = "이름은 2-50자 사이여야 합니다")
    val name: String,
    
    @field:NotBlank(message = "이메일은 필수입니다")
    @field:Email(message = "올바른 이메일 형식이 아닙니다")
    val email: String
)
```

### CORS 설정
```kotlin
@Configuration
class WebConfig : WebMvcConfigurer {
    
    override fun addCorsMappings(registry: CorsRegistry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:3000")
            .allowedMethods("GET", "POST", "PUT", "DELETE")
            .allowCredentials(true)
    }
}
```

## 성능 최적화

### JPA N+1 문제 해결
```kotlin
@Query("SELECT u FROM User u LEFT JOIN FETCH u.orders WHERE u.id = :id")
fun findUserWithOrders(@Param("id") id: Long): User?
```

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

#### 개발 환경 설정
```properties
# application.properties 참조
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