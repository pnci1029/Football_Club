package io.be.config

import io.be.security.TenantSecurityInterceptor
import io.be.service.SubdomainService
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.HandlerInterceptor
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.InterceptorRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
class WebConfig(
    private val subdomainService: SubdomainService,
    private val tenantSecurityInterceptor: TenantSecurityInterceptor,
    @Value("\${spring.profiles.active:dev}") private val activeProfile: String
) : WebMvcConfigurer {

    override fun addCorsMappings(registry: CorsRegistry) {
        val corsConfig = registry.addMapping("/**")
            .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(false)  // 임시로 false로 설정
            .maxAge(3600)

        // 환경별 허용 Origin 설정
        println("activeProfile = ${activeProfile}")
        when (activeProfile) {
            "dev", "local" -> {
                // 개발 환경: 모든 localhost 및 개발용 도메인 허용
                corsConfig.allowedOriginPatterns(
                    "http://localhost:*",
                    "https://localhost:*",
                    "http://127.0.0.1:*",
                    "https://127.0.0.1:*",
                    "http://*.localhost:*",
                    "https://*.localhost:*",
                    "http://*.football-club.kr",
                    "https://*.football-club.kr",
                    "http://222.122.81.196:*",
                    "https://admin.football-club.kr"
                )
            }
            "prod" -> {
                // 운영 환경: 특정 도메인만 허용
                corsConfig.allowedOriginPatterns(
                    "http://*.football-club.kr",
                    "https://*.football-club.kr",
                    "https://admin.football-club.kr",
                    "http://localhost:3000",
                    "https://localhost:3000",
                    "http://222.122.81.196:*",
                )
            }
            else -> {
                // 기본값: 개발 + 운영 모두 허용
                corsConfig.allowedOriginPatterns(
                    "http://localhost:*",
                    "https://localhost:*",
                    "http://*.localhost:*",
                    "https://*.localhost:*",
                    "http://*.football-club.kr",
                    "https://*.football-club.kr",
                    "http://222.122.81.196:*",
                    "https://admin.football-club.kr"
                )
            }
        }
    }

    override fun addInterceptors(registry: InterceptorRegistry) {
        // 보안 인터셉터 - 모든 요청에 대해 적용
        registry.addInterceptor(tenantSecurityInterceptor)
            .addPathPatterns("/**")
            .excludePathPatterns(
                "/api/actuator/**",  // Spring Actuator 경로 제외
                "/api/h2-console/**", // H2 콘솔 제외 (개발용)
                "/api/swagger-ui/**", // Swagger UI 제외
                "/api/api-docs/**"    // API 문서 제외
            )

        // 기존 서브도메인 인터셉터 - 특정 경로에만 적용
        registry.addInterceptor(SubdomainInterceptor(subdomainService))
            .addPathPatterns("/v1/team/**")
    }

    class SubdomainInterceptor(
        private val subdomainService: SubdomainService
    ) : HandlerInterceptor {

        override fun preHandle(
            request: HttpServletRequest,
            response: HttpServletResponse,
            handler: Any
        ): Boolean {
            val teamCode = subdomainService.extractTeamCodeFromRequest(request)

            // 개발 환경에서는 팀 코드가 없어도 허용
            val host = request.getHeader("X-Forwarded-Host")
                ?: request.getHeader("Host")
                ?: request.serverName
            val isLocalhost = host.contains("localhost") || host.contains("127.0.0.1")

            if (teamCode == null && !isLocalhost) {
                response.status = HttpServletResponse.SC_BAD_REQUEST
                response.contentType = "application/json"
                // CORS 헤더 추가 (credentials=true일 때 "*" 사용 불가)
                val origin = request.getHeader("Origin")
                if (origin != null) {
                    response.setHeader("Access-Control-Allow-Origin", origin)
                    response.setHeader("Access-Control-Allow-Credentials", "true")
                }
                response.writer.write("""
                    {
                        "success": false,
                        "error": {
                            "code": "INVALID_SUBDOMAIN",
                            "message": "유효하지 않은 서브도메인입니다."
                        }
                    }
                """.trimIndent())
                return false
            }

            // 요청에 팀 코드 추가 (컨트롤러에서 사용 가능)
            request.setAttribute("teamCode", teamCode)

            return true
        }
    }
}
