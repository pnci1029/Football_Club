# Football Club Backend Architecture Documentation

## 🚨 Critical System Components

### 1. API Routing & Context Path

#### Context Path Configuration
```yaml
# application.yml
server:
  servlet:
    context-path: /api
```

**⚠️ CRITICAL**: 모든 컨트롤러는 `/v1/...` 매핑이지만 실제 요청은 `/api/v1/...`로 해야 함

#### Controller Mapping vs Actual Endpoints
```kotlin
@RequestMapping("/v1/gallery")  // 컨트롤러 매핑
// 실제 엔드포인트: http://localhost:8082/api/v1/gallery
```

### 2. Multi-Tenant Architecture & Subdomain Routing

#### Host Header Priority Order
```kotlin
val host = request.getHeader("X-Forwarded-Host")  // 1순위
    ?: request.getHeader("Host")                   // 2순위  
    ?: request.serverName                          // 3순위
```

#### Frontend Client Configuration (CRITICAL)
모든 API 클라이언트는 반드시 `X-Forwarded-Host` 헤더를 포함해야 함:

```typescript
// ✅ 올바른 방법 (stadiumService, apiClient)
api.interceptors.request.use((config) => {
  const host = window.location.host;
  config.headers['X-Forwarded-Host'] = host;  // 필수!
  return config;
});

// ❌ 잘못된 방법 (기존 galleryAPI)
// X-Forwarded-Host 헤더 없음
```

#### Tenant Context Flow
1. **브라우저**: `bandi.localhost:3000`
2. **Frontend**: `X-Forwarded-Host: bandi.localhost:3000` 헤더 전송
3. **TenantSecurityInterceptor**: 서브도메인 `bandi` 추출
4. **TenantContextHolder**: 팀 정보로 컨텍스트 설정
5. **Service Layer**: `getCurrentTeamSubdomain()` 성공

### 3. Domain Routing Logic

#### Main Domain (TenantContext 설정 안됨)
- `localhost:8082`, `localhost:3000` 
- `football-club.kr`
- → 메인 페이지, 팀 정보 불필요

#### Admin Domain  
- `admin.localhost:3000`, `admin.football-club.kr`
- → 관리자 API만 허용

#### Subdomain (TenantContext 설정됨)
- `{team}.localhost:3000`, `{team}.football-club.kr`
- → 팀별 API, TenantContext 필수

### 4. Port Configuration

#### Development Ports
```yaml
# Backend
server:
  port: ${SERVER_PORT:8082}  # Blue deployment

# Frontend  
PORT=3001 npm start  # 서브도메인용
PORT=3000 npm start  # 메인용
```

#### API Base URL Configuration
```typescript
// config.ts - 올바른 포트 사용
API_URL: 'http://localhost:8082'

// galleryAPI.ts - 수정 전 잘못된 포트
const API_BASE_URL = 'http://localhost:8080'  // ❌ 8080 (잘못됨)
const API_BASE_URL = 'http://localhost:8082'  // ✅ 8082 (올바름)
```

### 5. Security Interceptor Flow

#### Request Processing Order
1. **Host Validation**: `isValidHost()` 체크
2. **Admin Domain**: `isAdminDomain()` → `handleAdminAccess()`
3. **Main Domain**: `isMainDomain()` → 바로 통과 (TenantContext 없음)
4. **Subdomain**: `extractSubdomain()` → `handleTenantAccess()` → TenantContext 설정

#### Critical Points
- **갤러리 API**: TenantContext 필요 → 서브도메인에서만 작동
- **팀 API**: TenantContext 필요 → 서브도메인에서만 작동
- **공용 API**: TenantContext 불필요 → 메인 도메인에서 작동

### 6. Common Pitfalls & Solutions

#### 문제 1: "팀 정보를 찾을 수 없습니다" 에러
**원인**: TenantContext가 설정되지 않음
**해결**: 
- Frontend에서 `X-Forwarded-Host` 헤더 추가
- 서브도메인 URL 사용 (`{team}.localhost:3000`)

#### 문제 2: 잘못된 포트로 요청
**원인**: Backend는 8082, Frontend는 8080으로 요청
**해결**: API_BASE_URL을 8082로 통일

#### 문제 3: API 경로 불일치  
**원인**: 컨트롤러 `/v1/...` vs 실제 요청 `/api/v1/...`
**해결**: context-path 확인, Frontend에서 `/api` 접두사 포함

### 7. Environment-Specific Configuration

#### Development Environment
```yaml
spring:
  profiles:
    active: local

# 허용 호스트
allowedHostPatterns:
  - "localhost:8082"
  - "*.localhost:3000"  # 서브도메인
  - "admin.localhost:3000"
```

#### Production Environment  
```yaml
spring:
  profiles:
    active: prod

# 허용 호스트
allowedHostPatterns:
  - "football-club.kr"
  - "*.football-club.kr" # 서브도메인
  - "admin.football-club.kr"
```

### 8. API Client Standards

#### 표준 API 클라이언트 구조
```typescript
class ApiClient {
  constructor() {
    this.client = axios.create({
      baseURL: getApiBaseUrl(),  // 8082 포트 사용
      headers: {
        'Content-Type': 'application/json',
      },
    });
    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use((config) => {
      // 필수: 서브도메인 인식용 헤더
      const host = window.location.host;
      config.headers['X-Forwarded-Host'] = host;
      
      // 선택: 인증 토큰
      const token = TokenManager.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    });
  }
}
```

### 9. Service Layer Patterns

#### Tenant-Aware Services
```kotlin
@Service
class GalleryService {
    private fun getCurrentTeamSubdomain(): String {
        return TenantContextHolder.getContextOrNull()?.subdomain 
            ?: throw IllegalStateException("팀 정보를 찾을 수 없습니다.")
    }
}
```

#### Public Services (Non-Tenant)
```kotlin
@Service  
class PublicService {
    // TenantContext 사용하지 않음
    // 메인 도메인에서 작동
}
```

### 10. API Response Pattern Standards 🚨

#### 백엔드 컨트롤러 응답 규칙
**✅ 올바른 패턴:**
```kotlin
@RestController
@RequestMapping("/v1/gallery")
class GalleryController(private val galleryService: GalleryService) {
    
    @GetMapping
    fun getGalleries(): ApiResponse<PageResponse<GalleryDto>> {
        val galleries = galleryService.getGalleries(searchRequest)
        return ApiResponse.success(galleries)
    }
    
    @GetMapping("/{id}")
    fun getGallery(@PathVariable id: Long): ApiResponse<GalleryDetailDto> {
        val gallery = galleryService.getGalleryDetail(id)
        return ApiResponse.success(gallery)
    }
    
    // 에러 처리
    @PostMapping
    fun createGallery(@RequestBody request: CreateGalleryRequest): ApiResponse<GalleryDto> {
        return try {
            val gallery = galleryService.createGallery(request)
            ApiResponse.success(gallery)
        } catch (e: Exception) {
            ApiResponse.error("CREATION_FAILED", e.message ?: "갤러리 생성에 실패했습니다")
        }
    }
}
```

#### 프론트엔드 API 호출 규칙
**✅ 올바른 패턴:**
```typescript
// 서비스 계층
class GalleryService {
    async getGalleries(params: GalleryParams): Promise<ApiResponse<PageResponse<GalleryDto>>> {
        return apiClient.get<ApiResponse<PageResponse<GalleryDto>>>('/api/v1/gallery', params);
    }
}

// 컴포넌트에서 사용
const loadGalleries = async () => {
    try {
        const response = await galleryService.getGalleries(params);
        if (response.success) {
            setGalleries(response.data.content);
            setTotalPages(response.data.totalPages);
        } else {
            setError(response.error?.message || '갤러리 로드 실패');
        }
    } catch (error) {
        setError(getErrorMessage(error, '갤러리 로드 중 오류 발생'));
    }
};
```

#### 금지된 패턴들
**❌ 절대 하지 말 것:**
```kotlin
// 백엔드에서 ResponseEntity 사용 금지
fun getGalleries(): ResponseEntity<List<GalleryDto>> { // ❌
    return ResponseEntity.ok(galleries)
}

// 데이터 직접 반환 금지  
fun getGalleries(): List<GalleryDto> { // ❌
    return galleries
}
```

```typescript
// 프론트엔드에서 response.data.data 패턴 금지
if (response.data.data) { // ❌ 이중 래핑
    setData(response.data.data.content);
}

// ApiResponse 없이 직접 접근 금지
setData(response.content); // ❌ response가 ApiResponse<T>인 경우
```

#### ApiResponse 구조
```kotlin
data class ApiResponse<T>(
    val success: Boolean,
    val data: T? = null,
    val message: String? = null,
    val error: ErrorDetails? = null,
    val timestamp: LocalDateTime = LocalDateTime.now()
)
```

#### 표준 사용법
**백엔드:**
- ✅ `ApiResponse.success(data)` - 성공 응답
- ✅ `ApiResponse.error(code, message)` - 에러 응답  
- ❌ `ResponseEntity.ok()` 사용 금지

**프론트엔드:**
- ✅ `response.success` - 성공 여부 확인
- ✅ `response.data` - 실제 데이터 접근
- ✅ `response.error` - 에러 정보 접근
- ❌ `response.data.data` 패턴 사용 금지

### 11. Debugging Tips

#### Host 정보 확인
```kotlin
private fun preHandle(request: HttpServletRequest): Boolean {
    val host = request.getHeader("X-Forwarded-Host")
        ?: request.getHeader("Host")
    
    println("X-Forwarded-Host: ${request.getHeader("X-Forwarded-Host")}")
    println("Host: ${request.getHeader("Host")}")
    println("Final host: $host")
}
```

#### TenantContext 상태 확인
```kotlin
val context = TenantContextHolder.getContextOrNull()
println("TenantContext: $context")
```

---

## 📝 Quick Reference

| Component | Port | URL Pattern | TenantContext |
|-----------|------|-------------|---------------|
| Backend | 8082 | `/api/v1/...` | Conditional |
| Frontend Main | 3000 | `localhost:3000` | No |
| Frontend Sub | 3000 | `{team}.localhost:3000` | Yes |
| Admin | 3000 | `admin.localhost:3000` | No |

## 🚨 Critical Rules

1. **API Response**: 모든 백엔드 컨트롤러는 `ApiResponse<T>` 직접 반환
2. **Host Header**: 모든 API 클라이언트에서 `X-Forwarded-Host` 헤더 필수 포함
3. **No ResponseEntity**: 백엔드에서 `ResponseEntity` 사용 금지 (파일 서빙 제외)
4. **Consistent Pattern**: 프론트엔드는 항상 `response.success`, `response.data` 패턴 사용