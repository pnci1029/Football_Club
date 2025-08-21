# 멀티테넌트 SaaS 아키텍처 가이드

## 🌍 멀티테넌트 개요

### 서브도메인 구조
```
football-club.kr (메인 도메인)
├── kim.football-club.kr      # 김씨 동호회
├── park.football-club.kr     # 박씨 동호회  
├── hong.football-club.kr     # 홍씨 동호회
└── admin.football-club.kr    # 통합 관리자
```

### 아키텍처 특징
- **단일 애플리케이션**: 하나의 코드베이스로 모든 테넌트 서비스
- **단일 데이터베이스**: 테넌트별 데이터 격리 (Row-level isolation)
- **서브도메인 기반 라우팅**: 각 동호회마다 독립적인 접근점
- **중앙 집중식 관리**: admin 서브도메인에서 전체 시스템 관리

## 🔐 데이터 격리 전략

### 1. Row-Level Security (RLS)
모든 테넌트 관련 데이터에 `teamId` 필드 필수 포함

```kotlin
@Entity
@Table(name = "players")
class Player(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    
    // 🔒 필수: 테넌트 격리를 위한 팀 ID
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    val team: Team,
    
    val name: String,
    val position: String
) {
    // 보안: 항상 팀 컨텍스트에서만 조회되도록 보장
}
```

### 2. Repository 레벨 보안
모든 쿼리에서 팀 필터링 강제 적용

```kotlin
interface PlayerRepository : JpaRepository<Player, Long> {
    // ✅ 올바른 방법: 항상 teamId 포함
    @Query("SELECT p FROM Player p WHERE p.team.id = :teamId AND p.id = :playerId")
    fun findByIdAndTeamId(playerId: Long, teamId: Long): Player?
    
    @Query("SELECT p FROM Player p WHERE p.team.id = :teamId")
    fun findAllByTeamId(teamId: Long, pageable: Pageable): Page<Player>
    
    // ❌ 위험한 방법: 전체 데이터 접근 가능
    // fun findById(id: Long): Player?  // 사용 금지
}
```

### 3. Service 레벨 검증
서비스에서 테넌트 컨텍스트 재검증

```kotlin
@Service
class PlayerService(
    private val playerRepository: PlayerRepository,
    private val subdomainService: SubdomainService
) {
    fun findPlayerById(playerId: Long, host: String): PlayerDto? {
        // 1. 서브도메인으로부터 팀 정보 추출
        val team = subdomainService.getTeamBySubdomain(host)
            ?: throw TeamNotFoundException("Invalid subdomain: $host")
        
        // 2. 팀 컨텍스트에서만 선수 조회
        val player = playerRepository.findByIdAndTeamId(playerId, team.id)
            ?: return null
            
        // 3. 추가 검증: 혹시나 하는 보안 체크
        if (player.team.id != team.id) {
            logger.warn("Security violation: Attempted cross-tenant access")
            throw SecurityException("Access denied")
        }
        
        return player.toDto()
    }
}
```

## 🌐 서브도메인 처리

### 1. DNS 설정
```
# DNS 레코드 설정
*.football-club.kr  A  YOUR_SERVER_IP
admin.football-club.kr  A  YOUR_SERVER_IP
```

### 2. SSL 인증서
와일드카드 SSL 인증서 사용
```bash
# Let's Encrypt 와일드카드 인증서 발급
certbot certonly --manual --preferred-challenges dns \
  -d *.football-club.kr -d football-club.kr
```

### 3. 백엔드 서브도메인 감지
```kotlin
@Service
class SubdomainService {
    fun getTeamBySubdomain(host: String): Team? {
        // kim.football-club.kr -> "kim" 추출
        val subdomain = extractSubdomain(host)
        
        if (subdomain == "admin") {
            return null // 관리자는 특별 처리
        }
        
        // 서브도메인으로 팀 조회
        return teamRepository.findBySubdomain(subdomain)
    }
    
    private fun extractSubdomain(host: String): String {
        return when {
            host.startsWith("localhost") -> "demo" // 개발용
            host.contains(".") -> host.split(".")[0]
            else -> host
        }
    }
}
```

### 4. 프론트엔드 서브도메인 처리
```typescript
// Context로 현재 테넌트 정보 관리
export const TenantContext = createContext<{
  currentTenant: Team | null;
  subdomain: string;
}>({
  currentTenant: null,
  subdomain: ''
});

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTenant, setCurrentTenant] = useState<Team | null>(null);
  const subdomain = window.location.hostname.split('.')[0];
  
  useEffect(() => {
    if (subdomain && subdomain !== 'admin') {
      // API 호출하여 테넌트 정보 로드
      teamService.getTeamBySubdomain(subdomain)
        .then(setCurrentTenant);
    }
  }, [subdomain]);
  
  return (
    <TenantContext.Provider value={{ currentTenant, subdomain }}>
      {children}
    </TenantContext.Provider>
  );
};
```

## 👑 관리자 시스템 (admin.football-club.kr)

### 1. 관리자 인증 및 권한
```kotlin
@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('SUPER_ADMIN')")
class SuperAdminController(
    private val teamService: TeamService
) {
    @PostMapping("/teams")
    fun createTeam(@RequestBody request: CreateTeamRequest): ResponseEntity<TeamDto> {
        // 새로운 동호회 생성
        val team = teamService.createTeam(request)
        return ResponseEntity.ok(ApiResponse.success(team))
    }
    
    @DeleteMapping("/teams/{teamId}")
    fun deleteTeam(@PathVariable teamId: Long): ResponseEntity<Void> {
        // 전체 팀 데이터 삭제 (GDPR 준수)
        teamService.deleteTeamCompletely(teamId)
        return ResponseEntity.noContent().build()
    }
}
```

### 2. 테넌트 관리 기능
- 새로운 동호회 등록 및 서브도메인 할당
- 동호회별 사용량 모니터링
- 테넌트별 커스터마이징 설정 (로고, 색상, 테마)
- 과금 및 구독 관리

## 🎨 테넌트별 커스터마이징

### 1. 테넌트 설정 엔티티
```kotlin
@Entity
@Table(name = "tenant_configs")
class TenantConfig(
    @Id
    val teamId: Long,
    
    @Column(unique = true)
    val subdomain: String,
    
    val logoUrl: String? = null,
    val primaryColor: String = "#0ea5e9",
    val secondaryColor: String = "#64748b",
    val customCSS: String? = null,
    
    val isActive: Boolean = true,
    val subscriptionLevel: String = "basic"
)
```

### 2. 프론트엔드 테마 적용
```typescript
const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentTenant } = useTenant();
  const [themeConfig, setThemeConfig] = useState<TenantConfig | null>(null);
  
  useEffect(() => {
    if (currentTenant) {
      tenantService.getThemeConfig(currentTenant.id)
        .then(config => {
          setThemeConfig(config);
          // CSS 변수 동적 설정
          document.documentElement.style.setProperty('--primary-color', config.primaryColor);
          document.documentElement.style.setProperty('--secondary-color', config.secondaryColor);
        });
    }
  }, [currentTenant]);
  
  return <div className="themed-app">{children}</div>;
};
```

## 📊 성능 최적화

### 1. 데이터베이스 인덱스
```sql
-- 테넌트별 조회 성능 최적화
CREATE INDEX idx_players_team_id ON players(team_id);
CREATE INDEX idx_stadiums_team_id ON stadiums(team_id);
CREATE INDEX idx_matches_team_id ON matches(team_id);

-- 복합 인덱스로 더 빠른 조회
CREATE INDEX idx_players_team_position ON players(team_id, position);
CREATE INDEX idx_matches_team_date ON matches(team_id, match_date);
```

### 2. 캐싱 전략
```kotlin
@Service
class PlayerService {
    @Cacheable("players", key = "#teamId + '_' + #playerId")
    fun findPlayerById(playerId: Long, teamId: Long): PlayerDto? {
        // 캐시 키에 teamId 포함하여 테넌트별 분리
    }
    
    @CacheEvict("players", key = "#teamId + '_*'")
    fun updatePlayer(playerId: Long, teamId: Long, request: UpdatePlayerRequest) {
        // 해당 팀의 캐시만 무효화
    }
}
```

## 🚨 보안 체크리스트

### 필수 보안 사항
- [ ] 모든 API에서 Host 헤더 기반 팀 검증
- [ ] Repository 메서드에서 teamId 필터링 강제
- [ ] Cross-tenant 데이터 접근 차단
- [ ] 관리자 API 별도 인증 구현
- [ ] 민감한 정보 로그 기록 금지
- [ ] 정기적인 보안 감사 및 테스트

### 개발 시 주의사항
```kotlin
// ❌ 절대 금지: 전역 조회
fun getAllPlayers(): List<Player> // 위험!

// ✅ 올바른 방법: 항상 테넌트 컨텍스트 포함  
fun getPlayersByTeam(teamId: Long): List<Player>
```

## 📈 모니터링 및 관리

### 1. 테넌트별 메트릭
- API 호출 횟수
- 데이터 사용량
- 사용자 활동량
- 에러 발생률

### 2. 알림 및 임계치 설정
- 과도한 트래픽 감지
- 데이터베이스 성능 모니터링
- 테넌트별 리소스 사용량 추적

## 🔧 배포 및 운영

### 1. 배포 전략
- Blue-Green 배포로 무중단 업데이트
- 테넌트별 점진적 배포 (카나리)
- 롤백 계획 수립

### 2. 백업 및 복구
- 테넌트별 데이터 백업
- 특정 테넌트만 복구 가능한 시스템
- 정기적인 백업 검증

이 가이드를 따라 구현하면 안전하고 확장 가능한 멀티테넌트 축구 동호회 플랫폼을 구축할 수 있습니다.