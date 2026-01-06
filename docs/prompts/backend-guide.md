# 백엔드 개발 종합 가이드 (Kotlin + Spring Boot)

## 🚨 중요: 개발 전 필독 사항
**모든 백엔드 개발 작업을 시작하기 전에 반드시 이 가이드를 읽고 진행해야 합니다.**

## 기술 스택
- **언어**: Kotlin 1.9+
- **프레임워크**: Spring Boot 3.x
- **빌드 도구**: Gradle (Kotlin DSL)
- **데이터베이스**: MySQL 8.0+, Redis (캐싱)
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
│   │   ├── AdminTeamController.kt
│   │   └── TenantController.kt   # SaaS 테넌트 관리
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
├── exception/
├── security/                    # 보안 관련 클래스
└── util/
```

## 멀티테넌트 아키텍처

### 서브도메인 기반 테넌트 분리
```kotlin
// 서브도메인 설정
@ConfigurationProperties(prefix = "app.subdomain")
data class SubdomainProperties(
    val enabled: Boolean = true,
    val pattern: String = "{team}.footballclub.com",
    val adminSubdomain: String = "admin.footballclub.com"
)

// 테넌트 컨텍스트 관리
data class TenantContext(
    val teamId: Long,
    val subdomain: String,
    val userId: String? = null,
    val sessionId: String? = null
)

object TenantContextHolder {
    private val contextHolder = ThreadLocal<TenantContext>()
    
    fun setContext(context: TenantContext) {
        contextHolder.set(context)
    }
    
    fun getTeamId(): Long {
        return getContext()?.teamId 
            ?: throw SecurityException("No tenant context found")
    }
    
    fun clear() {
        contextHolder.remove()
    }
}
```

### 테넌트 보안 인터셉터
```kotlin
@Component
class TenantSecurityInterceptor(
    private val subdomainService: SubdomainService,
    private val hostValidator: SecurityHostValidator
) : HandlerInterceptor {
    
    override fun preHandle(
        request: HttpServletRequest,
        response: HttpServletResponse,
        handler: Any
    ): Boolean {
        val host = request.getHeader("Host") ?: return false
        val clientIp = request.remoteAddr
        
        try {
            // 보안 검증
            val team = subdomainService.getTeamBySubdomain(host, clientIp)
            
            if (team != null) {
                // 테넌트 컨텍스트 설정
                val context = TenantContext(
                    teamId = team.id,
                    subdomain = extractSubdomain(host),
                    sessionId = request.getSession(false)?.id
                )
                TenantContextHolder.setContext(context)
            }
            
            return true
        } catch (e: SecurityException) {
            logger.warn("Security violation: ${e.message}")
            response.status = HttpStatus.FORBIDDEN.value()
            return false
        }
    }
    
    override fun afterCompletion(
        request: HttpServletRequest,
        response: HttpServletResponse,
        handler: Any,
        ex: Exception?
    ) {
        TenantContextHolder.clear()
    }
}
```

## 보안 강화 가이드

### 1. Host 헤더 검증
```kotlin
@Component
class SecurityHostValidator {
    private val allowedDomains = setOf(
        "localhost",
        "127.0.0.1", 
        "*.footballclub.com",
        "admin.footballclub.com"
    )
    
    fun validateHost(host: String, clientIp: String): HostValidationResult {
        // 1. NULL/빈 문자열 검증
        if (host.isBlank()) {
            logger.warn("Empty host header from IP: $clientIp")
            return HostValidationResult.INVALID
        }
        
        // 2. 허용된 도메인 패턴 검증
        if (!isAllowedDomain(host)) {
            logger.warn("Invalid domain: $host from IP: $clientIp")
            return HostValidationResult.INVALID
        }
        
        // 3. 추가 보안 검증 (길이, 특수문자 등)
        if (host.length > 255 || containsSuspiciousChars(host)) {
            logger.warn("Suspicious host header: $host from IP: $clientIp")
            return HostValidationResult.SUSPICIOUS
        }
        
        return HostValidationResult.VALID
    }
}
```

### 2. Repository 레벨 보안
```kotlin
// ❌ 위험한 전역 조회 방지
interface PlayerRepository : JpaRepository<Player, Long> {
    
    // 모든 조회에 teamId 필수 포함
    @Query("SELECT p FROM Player p WHERE p.team.id = :teamId AND p.id = :playerId")
    fun findByIdAndTeamId(
        @Param("playerId") playerId: Long, 
        @Param("teamId") teamId: Long
    ): Player?
    
    @Query("SELECT p FROM Player p WHERE p.team.id = :teamId")
    fun findAllByTeamId(
        @Param("teamId") teamId: Long,
        pageable: Pageable
    ): Page<Player>
    
    @Query("SELECT COUNT(p) FROM Player p WHERE p.team.id = :teamId")
    fun countByTeamId(@Param("teamId") teamId: Long): Long
    
    // ❌ 위험한 메서드들 제거
    // override fun findById(id: Long): Optional<Player> = throw UnsupportedOperationException("Use findByIdAndTeamId")
}
```

### 3. JWT 인증 시스템
```kotlin
@Component
class JwtTokenProvider {
    
    fun createAccessToken(adminId: Long): String {
        val claims = Jwts.claims().setSubject(adminId.toString())
        val now = Date()
        val validity = Date(now.time + accessTokenValidityInMilliseconds)
        
        return Jwts.builder()
            .setClaims(claims)
            .setIssuedAt(now)
            .setExpiration(validity)
            .signWith(SignatureAlgorithm.HS256, secretKey)
            .compact()
    }
    
    fun validateToken(token: String): Boolean {
        try {
            Jwts.parser().setSigningKey(secretKey).parseClaimsJws(token)
            return true
        } catch (e: JwtException) {
            return false
        } catch (e: IllegalArgumentException) {
            return false
        }
    }
    
    fun getAdminIdFromToken(token: String): Long {
        return Jwts.parser()
            .setSigningKey(secretKey)
            .parseClaimsJws(token)
            .body
            .subject
            .toLong()
    }
}

@Component  
class JwtAuthenticationFilter : OncePerRequestFilter() {
    
    override fun doFilterInternal(
        request: HttpServletRequest, 
        response: HttpServletResponse, 
        filterChain: FilterChain
    ) {
        val token = resolveToken(request)
        
        if (token != null && jwtTokenProvider.validateToken(token)) {
            val adminId = jwtTokenProvider.getAdminIdFromToken(token)
            val authentication = UsernamePasswordAuthenticationToken(adminId, null, emptyList())
            SecurityContextHolder.getContext().authentication = authentication
        }
        
        filterChain.doFilter(request, response)
    }
    
    private fun resolveToken(request: HttpServletRequest): String? {
        val bearerToken = request.getHeader("Authorization")
        return if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            bearerToken.substring(7)
        } else null
    }
}
```

## SaaS 테넌트 관리 시스템

### TenantController - 테넌트 관리 API
```kotlin
@RestController
@RequestMapping("/v1/admin/tenants")
class TenantController(
    private val teamService: TeamService,
    private val playerService: PlayerService,
    private val stadiumService: StadiumService
) {
    
    @GetMapping
    fun getAllTenants(): ResponseEntity<ApiResponse<List<TenantSummary>>> {
        val tenants = teamService.getAllTeamsWithStats()
        return ResponseEntity.ok(ApiResponse.success(tenants))
    }
    
    @GetMapping("/{teamCode}")
    fun getTenantInfo(@PathVariable teamCode: String): ResponseEntity<ApiResponse<TenantDetail>> {
        val tenant = teamService.getTenantByCode(teamCode)
        return ResponseEntity.ok(ApiResponse.success(tenant))
    }
    
    @GetMapping("/{teamCode}/dashboard")
    fun getTenantDashboard(@PathVariable teamCode: String): ResponseEntity<ApiResponse<TenantDashboard>> {
        val dashboard = teamService.getTenantDashboard(teamCode)
        return ResponseEntity.ok(ApiResponse.success(dashboard))
    }
    
    @PostMapping
    fun createTenant(@RequestBody request: CreateTenantRequest): ResponseEntity<ApiResponse<TenantDetail>> {
        val tenant = teamService.createTenant(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(tenant))
    }
}
```

### 테넌트 설정 엔티티
```kotlin
@Entity
@Table(name = "tenant_configs")
data class TenantConfig(
    @Id
    val teamId: Long,
    
    @Column(unique = true, nullable = false)
    val subdomain: String,
    
    // 테마 설정
    val logoUrl: String? = null,
    val primaryColor: String = "#0ea5e9", 
    val secondaryColor: String = "#64748b",
    val customCSS: String? = null,
    
    // 구독 관리
    val subscriptionPlan: String = "basic",
    val isActive: Boolean = true,
    val maxPlayers: Int = 30,
    val maxStadiums: Int = 5,
    
    @CreationTimestamp
    val createdAt: LocalDateTime = LocalDateTime.now()
)
```

## API 경로 규칙

모든 백엔드 API는 반드시 `/api` 접두사로 시작해야 합니다.

**경로 구조:**
- 공개 API: `/api/v1/{resource}` (예: `/api/v1/players`, `/api/v1/stadiums`)
- 관리자 API: `/api/admin/{resource}` (예: `/api/admin/players`, `/api/admin/teams`)
- 테넌트 관리: `/api/v1/admin/tenants`

## Controller 패턴

```kotlin
@RestController
@RequestMapping("/v1/players")
@Validated
class PlayerController(
    private val playerService: PlayerService
) {
    
    @GetMapping
    fun getPlayers(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int
    ): ResponseEntity<ApiResponse<Page<PlayerDto>>> {
        val teamId = TenantContextHolder.getTeamId() // 테넌트 컨텍스트에서 팀 ID 가져오기
        val players = playerService.findPlayersByTeam(teamId, PageRequest.of(page, size))
        return ResponseEntity.ok(ApiResponse.success(players))
    }
    
    @PostMapping
    fun createPlayer(
        @Valid @RequestBody request: CreatePlayerRequest
    ): ResponseEntity<ApiResponse<PlayerDto>> {
        val teamId = TenantContextHolder.getTeamId()
        val player = playerService.createPlayer(teamId, request)
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(player))
    }
}
```

## Service 계층 - 테넌트 격리

```kotlin
@Service
@Transactional(readOnly = true)
class PlayerService(
    private val playerRepository: PlayerRepository,
    private val tenantUsageLimiter: TenantUsageLimiter
) {
    
    @Transactional
    fun createPlayer(teamId: Long, request: CreatePlayerRequest): PlayerDto {
        // 사용량 제한 체크
        val usageCheck = tenantUsageLimiter.checkPlayerLimit(teamId)
        if (!usageCheck.allowed) {
            throw UsageLimitExceededException("Player limit exceeded: ${usageCheck.current}/${usageCheck.limit}")
        }
        
        val player = Player(
            name = request.name,
            position = request.position,
            teamId = teamId // 반드시 현재 테넌트 ID 사용
        )
        val savedPlayer = playerRepository.save(player)
        return savedPlayer.toDto()
    }
    
    fun findPlayersByTeam(teamId: Long, pageable: Pageable): Page<PlayerDto> {
        return playerRepository.findAllByTeamId(teamId, pageable).map { it.toDto() }
    }
}
```

## 예외 처리 시스템

### 커스텀 예외 클래스
```kotlin
// 팀 관련 예외
class TeamNotFoundException(id: Long) : RuntimeException("Team not found with id: $id")
class TeamCodeAlreadyExistsException(code: String) : RuntimeException("Team code already exists: $code")

// 선수 관련 예외
class PlayerNotFoundException(id: Long) : RuntimeException("Player not found with id: $id")
class PlayerAlreadyExistsException(name: String, teamId: Long) : RuntimeException("Player already exists: $name in team $teamId")

// 보안 관련 예외
class InvalidSubdomainException(subdomain: String) : RuntimeException("Invalid subdomain: $subdomain")
class CrossTenantAccessException(message: String) : RuntimeException(message)
class UsageLimitExceededException(message: String) : RuntimeException(message)
```

### 글로벌 예외 핸들러
```kotlin
@RestControllerAdvice
class GlobalExceptionHandler {
    
    @ExceptionHandler(TeamNotFoundException::class)
    fun handleTeamNotFound(ex: TeamNotFoundException): ResponseEntity<ApiResponse<Nothing>> {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiResponse.error("TEAM_NOT_FOUND", ex.message))
    }
    
    @ExceptionHandler(CrossTenantAccessException::class)
    fun handleCrossTenantAccess(ex: CrossTenantAccessException): ResponseEntity<ApiResponse<Nothing>> {
        logger.error("Cross-tenant access attempt: ${ex.message}")
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(ApiResponse.error("ACCESS_DENIED", "Access denied"))
    }
    
    @ExceptionHandler(UsageLimitExceededException::class)
    fun handleUsageLimitExceeded(ex: UsageLimitExceededException): ResponseEntity<ApiResponse<Nothing>> {
        return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED)
            .body(ApiResponse.error("USAGE_LIMIT_EXCEEDED", ex.message))
    }
    
    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidation(ex: MethodArgumentNotValidException): ResponseEntity<ApiResponse<Nothing>> {
        val errors = ex.bindingResult.fieldErrors.map { "${it.field}: ${it.defaultMessage}" }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.error("VALIDATION_ERROR", errors.joinToString(", ")))
    }
    
    @ExceptionHandler(Exception::class)
    fun handleGeneral(ex: Exception): ResponseEntity<ApiResponse<Nothing>> {
        logger.error("Unexpected error", ex)
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiResponse.error("INTERNAL_ERROR", "Internal server error"))
    }
}
```

## API 응답 표준화

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
    }
}
```

## 사용량 제한 및 모니터링

```kotlin
@Component
class TenantUsageLimiter {
    
    fun checkPlayerLimit(teamId: Long): UsageCheckResult {
        val config = getTenantConfig(teamId)
        val currentCount = playerRepository.countByTeamId(teamId)
        val limit = config.getSubscriptionLimits().players
        
        return UsageCheckResult(
            allowed = currentCount < limit,
            current = currentCount.toInt(),
            limit = limit,
            percentage = (currentCount.toDouble() / limit * 100).toInt()
        )
    }
    
    @EventListener
    fun handleResourceCreation(event: ResourceCreatedEvent) {
        val usage = checkUsageLimit(event.teamId, event.resourceType)
        
        if (!usage.allowed) {
            throw UsageLimitExceededException(
                "Limit exceeded for ${event.resourceType}: ${usage.current}/${usage.limit}"
            )
        }
        
        // 80% 임계치 도달 시 경고
        if (usage.percentage >= 80) {
            sendUsageWarningEmail(event.teamId, usage)
        }
    }
}
```

## 보안 이벤트 로깅

```kotlin
@Component
class SecurityEventLogger {
    
    fun logSecurityEvent(
        event: SecurityEvent,
        request: HttpServletRequest,
        details: Map<String, Any> = emptyMap()
    ) {
        val logData = SecurityLogEntry(
            timestamp = Instant.now(),
            event = event,
            clientIp = request.remoteAddr,
            userAgent = request.getHeader("User-Agent"),
            host = request.getHeader("Host"),
            path = request.requestURI,
            method = request.method,
            tenantContext = TenantContextHolder.getContext(),
            details = details
        )
        
        // 심각도에 따른 로깅 레벨
        when (event.severity) {
            HIGH -> {
                logger.error("HIGH SECURITY EVENT: {}", logData)
                alertingService.sendSecurityAlert(logData)
            }
            MEDIUM -> logger.warn("SECURITY EVENT: {}", logData)
            LOW -> logger.info("Security Event: {}", logData)
        }
        
        // 보안 로그 DB 저장 (감사 용도)
        securityLogRepository.save(logData.toEntity())
    }
}

enum class SecurityEvent(val severity: SecuritySeverity) {
    INVALID_HOST_HEADER(HIGH),
    CROSS_TENANT_ACCESS_ATTEMPT(HIGH),
    UNAUTHORIZED_ADMIN_ACCESS(HIGH),
    USAGE_LIMIT_EXCEEDED(MEDIUM),
    SUSPICIOUS_API_PATTERN(MEDIUM),
    RATE_LIMIT_EXCEEDED(LOW)
}
```

## Spring Boot 설정

### application.properties
```properties
# 서버 설정
server.port=8082
server.servlet.context-path=/api

# 서브도메인 설정
app.subdomain.enabled=true
app.subdomain.pattern={team}.footballclub.com
app.admin.subdomain=admin.footballclub.com

# 데이터베이스 설정 (프로덕션)
spring.datasource.url=jdbc:mysql://localhost:3306/footballclub
spring.datasource.username=${MYSQL_USER}
spring.datasource.password=${MYSQL_PASSWORD}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA 설정
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# Redis 설정
spring.redis.host=${REDIS_HOST:localhost}
spring.redis.port=6379
spring.redis.timeout=2000ms

# 파일 업로드 설정
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=5MB
app.upload.path=/opt/football-club/uploads

# JWT 설정
app.jwt.secret=${JWT_SECRET}
app.jwt.access-token-validity=900000
app.jwt.refresh-token-validity=86400000

# 로깅 설정
logging.level.io.be=INFO
logging.level.org.springframework.security=DEBUG
logging.pattern.console=%d{yyyy-MM-dd HH:mm:ss} - %msg%n
```

## 테스트 가이드

### 단위 테스트
```kotlin
@ExtendWith(MockitoExtension::class)
class PlayerServiceTest {
    
    @Mock
    lateinit var playerRepository: PlayerRepository
    
    @InjectMocks
    lateinit var playerService: PlayerService
    
    @Test
    fun `선수 생성 성공`() {
        // given
        val teamId = 1L
        val request = CreatePlayerRequest("John", "FW")
        val player = Player(1L, "John", "FW", teamId)
        
        whenever(playerRepository.save(any())).thenReturn(player)
        
        // when
        val result = playerService.createPlayer(teamId, request)
        
        // then
        assertThat(result.id).isEqualTo(1L)
        assertThat(result.name).isEqualTo("John")
    }
}
```

### 보안 테스트
```kotlin
@SpringBootTest
class TenantSecurityTest {
    
    @Test
    fun `다른 테넌트 데이터 접근 차단 테스트`() {
        // given
        val team1Id = 1L
        val team2Id = 2L
        val player = createPlayerForTeam(team2Id)
        
        // when & then
        TenantContextHolder.setContext(TenantContext(team1Id, "team1"))
        
        assertThrows<CrossTenantAccessException> {
            playerService.getPlayer(player.id)
        }
    }
    
    @Test  
    fun `Host 헤더 조작 시 접근 거부 테스트`() {
        // given
        val request = MockHttpServletRequest()
        request.addHeader("Host", "malicious-domain.com")
        
        // when
        val result = tenantSecurityInterceptor.preHandle(request, response, handler)
        
        // then
        assertThat(result).isFalse()
        assertThat(response.status).isEqualTo(HttpStatus.FORBIDDEN.value())
    }
}
```

## 성능 최적화

### JPA N+1 문제 해결
```kotlin
@Repository
interface PlayerRepository : JpaRepository<Player, Long> {
    
    @Query("SELECT p FROM Player p JOIN FETCH p.team WHERE p.team.id = :teamId")
    fun findPlayersWithTeam(@Param("teamId") teamId: Long): List<Player>
    
    @EntityGraph(attributePaths = ["team"])
    fun findAllByTeamId(teamId: Long, pageable: Pageable): Page<Player>
}
```

### Redis 캐싱 전략
```kotlin
@Service
class TeamService {
    
    @Cacheable(value = ["teams"], key = "#teamId")
    fun getTeamById(teamId: Long): TeamDto {
        return teamRepository.findById(teamId)?.toDto()
            ?: throw TeamNotFoundException(teamId)
    }
    
    @CacheEvict(value = ["teams"], key = "#teamId")
    fun updateTeam(teamId: Long, request: UpdateTeamRequest): TeamDto {
        // 업데이트 로직
    }
}
```

## 🚀 우선순위별 개발 계획

### Phase 1: Critical 보안 이슈 (즉시)
1. ✅ **Host 헤더 검증 강화**
2. ✅ **TenantSecurityInterceptor 완성**
3. ✅ **Repository 보안 강화**
4. ⚠️ **JWT 인증 시스템 구현** - 진행 필요

### Phase 2: 핵심 기능 완성 (1-2주)
1. **Match 엔티티 및 AdminMatchController 구현**
2. **파일 업로드 시스템 구현**
3. **전역 예외 처리 시스템 구현**
4. **사용량 제한 시스템 구현**

### Phase 3: 운영 안정성 (2-3주)
1. **보안 이벤트 로깅 시스템**
2. **성능 최적화 및 캐싱**
3. **모니터링 및 알림 시스템**
4. **종합 테스트 및 보안 점검**

## 보안 체크리스트

### 배포 전 필수 확인사항
- [ ] Host 헤더 검증 구현
- [ ] Cross-tenant 데이터 접근 방지
- [ ] JWT 토큰 검증 구현
- [ ] 모든 Repository에 teamId 필터링 적용
- [ ] 사용량 제한 체크 구현
- [ ] 보안 이벤트 로깅 적용
- [ ] 환경 변수 암호화
- [ ] 민감한 정보 로그 제거

이 가이드를 참고하여 안전하고 확장 가능한 멀티테넌트 백엔드 시스템을 구축하세요.# 커뮤니티 기능 개발 문서

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