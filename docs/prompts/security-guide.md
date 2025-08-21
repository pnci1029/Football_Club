# 멀티테넌트 보안 강화 가이드

## 🔒 보안 위험 분석

### 멀티테넌트 환경에서의 주요 위협
1. **Cross-tenant 데이터 노출**: 다른 동호회 데이터 접근
2. **서브도메인 스푸핑**: 가짜 서브도메인으로 데이터 탈취 시도
3. **권한 에스컬레이션**: 일반 사용자가 관리자 권한 획득
4. **데이터 유출**: 민감한 개인정보 및 팀 정보 노출
5. **서비스 거부 공격**: 특정 테넌트가 전체 시스템에 영향

## 🛡️ 계층별 보안 구현

### 1. 네트워크 레벨 보안

#### SSL/TLS 강화
```nginx
# Nginx SSL 설정
server {
    listen 443 ssl http2;
    server_name *.football-club.kr;
    
    # 와일드카드 SSL 인증서
    ssl_certificate /path/to/wildcard.crt;
    ssl_certificate_key /path/to/wildcard.key;
    
    # 강력한 SSL 설정
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    
    # HSTS 헤더
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
}
```

#### Rate Limiting
```nginx
# 테넌트별 Rate Limiting
http {
    # IP당 제한
    limit_req_zone $binary_remote_addr zone=global:10m rate=10r/s;
    
    # 서브도메인별 제한 
    limit_req_zone $host zone=tenant:10m rate=100r/s;
    
    server {
        location /api/ {
            limit_req zone=global burst=20 nodelay;
            limit_req zone=tenant burst=200 nodelay;
        }
    }
}
```

### 2. 애플리케이션 레벨 보안

#### Host 헤더 검증 강화
```kotlin
@Component
class SecurityHostValidator {
    
    private val allowedHosts = setOf(
        "localhost:3000",  // 개발용
        "*.football-club.kr",
        "admin.football-club.kr"
    )
    
    fun validateHost(host: String): Boolean {
        // NULL 또는 빈 문자열 체크
        if (host.isBlank()) return false
        
        // 허용된 호스트 패턴 매칭
        return allowedHosts.any { pattern ->
            when {
                pattern.startsWith("*") -> {
                    val domain = pattern.removePrefix("*")
                    host.endsWith(domain)
                }
                else -> host.equals(pattern, ignoreCase = true)
            }
        }
    }
    
    fun extractSubdomain(host: String): String? {
        if (!validateHost(host)) return null
        
        return when {
            host.startsWith("localhost") -> "demo"
            host == "football-club.kr" -> null  // 메인 도메인
            host.contains(".football-club.kr") -> {
                host.split(".")[0].takeIf { it.isNotBlank() }
            }
            else -> null
        }
    }
}
```

#### 서브도메인 기반 인증 토큰
```kotlin
@Service
class TenantTokenService {
    
    fun generateTenantToken(teamId: Long, subdomain: String): String {
        val claims = mapOf(
            "teamId" to teamId,
            "subdomain" to subdomain,
            "iat" to System.currentTimeMillis() / 1000,
            "exp" to (System.currentTimeMillis() + 3600000) / 1000 // 1시간
        )
        
        return Jwts.builder()
            .setClaims(claims)
            .signWith(SignatureAlgorithm.HS256, secretKey)
            .compact()
    }
    
    fun validateTenantToken(token: String, currentSubdomain: String): TenantContext? {
        try {
            val claims = Jwts.parser()
                .setSigningKey(secretKey)
                .parseClaimsJws(token)
                .body
            
            val tokenSubdomain = claims["subdomain"] as String
            val teamId = claims["teamId"] as Long
            
            // 토큰의 서브도메인과 현재 요청 서브도메인 일치 확인
            if (tokenSubdomain != currentSubdomain) {
                logger.warn("Token subdomain mismatch: token=$tokenSubdomain, current=$currentSubdomain")
                return null
            }
            
            return TenantContext(teamId = teamId, subdomain = tokenSubdomain)
        } catch (e: Exception) {
            logger.error("Token validation failed", e)
            return null
        }
    }
}
```

### 3. 데이터베이스 레벨 보안

#### Row-Level Security 구현
```kotlin
@Entity
@Table(name = "players")
@Where(clause = "team_id = :currentTeamId")  // Hibernate 필터
class Player(
    @Id
    val id: Long,
    
    @Column(name = "team_id", nullable = false)
    val teamId: Long,  // 반드시 NOT NULL
    
    val name: String,
    val position: String
) {
    init {
        // 생성 시 teamId 필수 검증
        require(teamId > 0) { "Team ID must be provided" }
    }
}
```

#### Repository 보안 패턴
```kotlin
@Repository
interface SecurePlayerRepository : JpaRepository<Player, Long> {
    
    // ✅ 보안: 항상 teamId 포함하여 조회
    @Query("""
        SELECT p FROM Player p 
        WHERE p.teamId = :teamId AND p.id = :playerId
    """)
    fun findByIdAndTeamId(
        @Param("playerId") playerId: Long, 
        @Param("teamId") teamId: Long
    ): Player?
    
    @Query("""
        SELECT p FROM Player p 
        WHERE p.teamId = :teamId 
        AND p.isActive = true
        ORDER BY p.name
    """)
    fun findActivePlayersByTeamId(
        @Param("teamId") teamId: Long,
        pageable: Pageable
    ): Page<Player>
    
    // ❌ 금지: 전역 조회 메서드는 구현하지 않음
    // fun findById(id: Long): Player?
    // fun findAll(): List<Player>
}
```

#### 데이터베이스 감사 로깅
```kotlin
@Entity
@EntityListeners(AuditingEntityListener::class)
abstract class AuditableEntity(
    @CreatedDate
    @Column(updatable = false)
    var createdAt: LocalDateTime? = null,
    
    @LastModifiedDate
    var updatedAt: LocalDateTime? = null,
    
    @CreatedBy
    @Column(updatable = false)
    var createdBy: String? = null,
    
    @LastModifiedBy
    var lastModifiedBy: String? = null
)

@Component
class SecurityAuditor : AuditorAware<String> {
    override fun getCurrentAuditor(): Optional<String> {
        val tenantContext = TenantContextHolder.getContext()
        return Optional.of("tenant:${tenantContext.subdomain}:${tenantContext.userId ?: "anonymous"}")
    }
}
```

### 4. API 레벨 보안

#### 인터셉터를 통한 테넌트 검증
```kotlin
@Component
class TenantSecurityInterceptor(
    private val hostValidator: SecurityHostValidator,
    private val subdomainService: SubdomainService
) : HandlerInterceptor {
    
    override fun preHandle(
        request: HttpServletRequest,
        response: HttpServletResponse,
        handler: Any
    ): Boolean {
        val host = request.getHeader("Host") ?: return false
        
        // 1. Host 헤더 검증
        if (!hostValidator.validateHost(host)) {
            logger.warn("Invalid host header: $host from IP: ${request.remoteAddr}")
            response.status = HttpStatus.FORBIDDEN.value()
            return false
        }
        
        // 2. 관리자 페이지 접근 제어
        if (host.startsWith("admin.")) {
            return validateAdminAccess(request, response)
        }
        
        // 3. 테넌트 컨텍스트 설정
        val subdomain = hostValidator.extractSubdomain(host)
        if (subdomain != null) {
            val team = subdomainService.getTeamBySubdomain(subdomain)
            if (team == null) {
                response.status = HttpStatus.NOT_FOUND.value()
                return false
            }
            
            // 테넌트 컨텍스트 설정
            TenantContextHolder.setContext(
                TenantContext(teamId = team.id, subdomain = subdomain)
            )
        }
        
        return true
    }
    
    private fun validateAdminAccess(request: HttpServletRequest, response: HttpServletResponse): Boolean {
        // 관리자 인증 토큰 검증
        val authHeader = request.getHeader("Authorization")
        if (authHeader?.startsWith("Bearer ") != true) {
            response.status = HttpStatus.UNAUTHORIZED.value()
            return false
        }
        
        // JWT 토큰에서 관리자 권한 확인
        val token = authHeader.removePrefix("Bearer ")
        if (!isValidAdminToken(token)) {
            response.status = HttpStatus.FORBIDDEN.value()
            return false
        }
        
        return true
    }
    
    override fun afterCompletion(
        request: HttpServletRequest,
        response: HttpServletResponse,
        handler: Any,
        ex: Exception?
    ) {
        // 테넌트 컨텍스트 정리
        TenantContextHolder.clear()
    }
}
```

#### Thread-Local 테넌트 컨텍스트
```kotlin
data class TenantContext(
    val teamId: Long,
    val subdomain: String,
    val userId: String? = null
)

object TenantContextHolder {
    private val contextHolder = ThreadLocal<TenantContext>()
    
    fun setContext(context: TenantContext) {
        contextHolder.set(context)
    }
    
    fun getContext(): TenantContext {
        return contextHolder.get() 
            ?: throw SecurityException("No tenant context found")
    }
    
    fun getTeamId(): Long = getContext().teamId
    
    fun clear() {
        contextHolder.remove()
    }
}
```

## 🔍 보안 모니터링

### 1. 보안 이벤트 로깅
```kotlin
@Component
class SecurityEventLogger {
    
    private val logger = LoggerFactory.getLogger(this::class.java)
    
    fun logSecurityEvent(
        event: SecurityEvent,
        request: HttpServletRequest,
        additionalInfo: Map<String, Any> = emptyMap()
    ) {
        val logData = mapOf(
            "timestamp" to Instant.now(),
            "event" to event.name,
            "severity" to event.severity,
            "clientIp" to request.remoteAddr,
            "userAgent" to request.getHeader("User-Agent"),
            "host" to request.getHeader("Host"),
            "path" to request.requestURI,
            "method" to request.method,
            "sessionId" to request.getSession(false)?.id,
            "tenantContext" to TenantContextHolder.getContext(),
            "additionalInfo" to additionalInfo
        )
        
        when (event.severity) {
            SecurityEvent.Severity.HIGH -> logger.error("Security Event: {}", logData)
            SecurityEvent.Severity.MEDIUM -> logger.warn("Security Event: {}", logData)
            SecurityEvent.Severity.LOW -> logger.info("Security Event: {}", logData)
        }
    }
}

enum class SecurityEvent(val severity: SecurityEvent.Severity) {
    INVALID_HOST_HEADER(Severity.HIGH),
    CROSS_TENANT_ACCESS_ATTEMPT(Severity.HIGH),
    UNAUTHORIZED_ADMIN_ACCESS(Severity.HIGH),
    SUSPICIOUS_API_PATTERN(Severity.MEDIUM),
    RATE_LIMIT_EXCEEDED(Severity.LOW);
    
    enum class Severity { HIGH, MEDIUM, LOW }
}
```

### 2. 침입 탐지 시스템
```kotlin
@Component
class IntrusionDetectionSystem {
    
    private val suspiciousActivityCache = CacheBuilder.newBuilder()
        .maximumSize(10000)
        .expireAfterWrite(1, TimeUnit.HOURS)
        .build<String, AtomicInteger>()
    
    fun checkSuspiciousActivity(clientIp: String, event: String): Boolean {
        val key = "$clientIp:$event"
        val count = suspiciousActivityCache.get(key) { AtomicInteger(0) }
        
        val currentCount = count.incrementAndGet()
        
        // 임계값 초과 시 차단
        return when (event) {
            "cross_tenant_attempt" -> currentCount > 3
            "invalid_host" -> currentCount > 10
            "failed_auth" -> currentCount > 5
            else -> false
        }
    }
    
    fun blockSuspiciousIp(clientIp: String, duration: Duration = Duration.ofMinutes(30)) {
        // Redis나 데이터베이스에 차단 IP 저장
        blockedIpService.blockIp(clientIp, duration)
        
        logger.warn("Blocked suspicious IP: $clientIp for $duration")
    }
}
```

## 🚨 보안 체크리스트

### 개발 단계
- [ ] 모든 API 엔드포인트에서 Host 헤더 검증
- [ ] Repository 메서드에서 teamId 필터링 강제
- [ ] 테스트 코드에서 Cross-tenant 접근 시도 검증
- [ ] 민감한 정보 로깅 방지
- [ ] SQL 인젝션 방지 (Prepared Statement 사용)
- [ ] XSS 방지 (입력값 이스케이핑)

### 배포 단계  
- [ ] SSL/TLS 인증서 적용
- [ ] Rate Limiting 설정
- [ ] 방화벽 규칙 적용
- [ ] 보안 헤더 설정 (HSTS, CSP 등)
- [ ] 데이터베이스 접근 권한 최소화

### 운영 단계
- [ ] 보안 로그 정기적 검토
- [ ] 침입 탐지 알림 설정
- [ ] 정기적 보안 감사
- [ ] 취약점 스캔 및 패치
- [ ] 백업 데이터 암호화

## 🔧 보안 사고 대응 절차

### 1. 즉시 대응 (1-4시간)
1. 의심스러운 활동 감지 시 해당 IP 차단
2. 영향받은 테넌트 파악 및 통지
3. 시스템 로그 백업 및 분석 준비

### 2. 단기 대응 (4-24시간)
1. 보안 사고 원인 분석
2. 피해 범위 정확한 파악
3. 임시 보안 패치 적용

### 3. 장기 대응 (1-7일)
1. 근본적인 보안 취약점 수정
2. 보안 정책 및 절차 개선
3. 사후 보고서 작성 및 공유

이 가이드를 따라 구현하면 멀티테넌트 환경에서도 안전한 축구 동호회 플랫폼을 운영할 수 있습니다.