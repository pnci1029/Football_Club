package io.be.security

import io.be.exception.InvalidSubdomainException
import io.be.exception.SubdomainAccessDeniedException
import io.be.exception.TeamNotFoundException
import io.be.service.SubdomainService
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Component
import org.springframework.web.servlet.HandlerInterceptor
import java.time.Instant

@Component
class TenantSecurityInterceptor(
    private val subdomainService: SubdomainService,
    private val securityEventLogger: SecurityEventLogger
) : HandlerInterceptor {

    private val logger = LoggerFactory.getLogger(TenantSecurityInterceptor::class.java)

    // 허용된 호스트 패턴
    private val allowedHostPatterns = setOf(
        "localhost:8082",      // 개발용 백엔드
        "localhost:3000",      // 개발용 프론트엔드
        "127.0.0.1:8082",
        "127.0.0.1:3000",
        "*.localhost:3000",    // 개발용 서브도메인 (예: team.localhost:3000)
        "*.localhost:8082",    // 개발용 서브도메인 (예: admin.localhost:8082)
        "*.football-club.kr",  // 프로덕션 서브도메인
        "admin.football-club.kr"
    )

    override fun preHandle(
        request: HttpServletRequest,
        response: HttpServletResponse,
        handler: Any
    ): Boolean {
        val startTime = System.currentTimeMillis()

        try {
            // 1. Host 헤더 검증
            val host = request.getHeader("Host")
            if (host.isNullOrBlank()) {
                securityEventLogger.logSecurityEvent(
                    SecurityEvent.MISSING_HOST_HEADER,
                    request,
                    mapOf("reason" to "Host header is missing or blank")
                )
                response.status = HttpStatus.BAD_REQUEST.value()
                return false
            }

            if (!isValidHost(host)) {
                securityEventLogger.logSecurityEvent(
                    SecurityEvent.INVALID_HOST_HEADER,
                    request,
                    mapOf("host" to host, "reason" to "Host not in allowed patterns")
                )
                response.status = HttpStatus.FORBIDDEN.value()
                return false
            }

            // 2. 관리자 도메인 처리
            if (isAdminDomain(host)) {
                return handleAdminAccess(request, response)
            }

            // 3. 메인 도메인 처리 (랜딩 페이지)
            if (isMainDomain(host)) {
                // 메인 도메인은 별도 검증 없이 통과
                return true
            }

            // 4. 서브도메인 처리 (테넌트)
            return handleTenantAccess(request, response, host)

        } catch (exception: Exception) {
            logger.error("Security interceptor error for ${request.method} ${request.requestURI}", exception)
            securityEventLogger.logSecurityEvent(
                SecurityEvent.INTERCEPTOR_ERROR,
                request,
                mapOf(
                    "error" to exception.javaClass.simpleName,
                    "message" to (exception.message ?: "Unknown error")
                )
            )
            response.status = HttpStatus.INTERNAL_SERVER_ERROR.value()
            return false
        } finally {
            val processingTime = System.currentTimeMillis() - startTime
            if (processingTime > 100) { // 100ms 이상 걸린 경우 로깅
                logger.warn("Slow security check: ${processingTime}ms for ${request.method} ${request.requestURI}")
            }
        }
    }

    private fun handleAdminAccess(
        request: HttpServletRequest,
        response: HttpServletResponse
    ): Boolean {
        // 관리자 API 경로 확인
        val uri = request.requestURI
        if (!uri.startsWith("/api/admin/") && !uri.startsWith("/api/v1/admin/")) {
            securityEventLogger.logSecurityEvent(
                SecurityEvent.UNAUTHORIZED_ADMIN_ACCESS,
                request,
                mapOf("uri" to uri, "reason" to "Non-admin URI accessed from admin domain")
            )
            response.status = HttpStatus.FORBIDDEN.value()
            return false
        }

        // TODO: JWT 토큰 검증 추가 예정
        // val authHeader = request.getHeader("Authorization")
        // if (!isValidAdminToken(authHeader)) {
        //     response.status = HttpStatus.UNAUTHORIZED.value()
        //     return false
        // }

        logger.debug("Admin access granted for ${request.method} $uri")
        return true
    }

    private fun handleTenantAccess(
        request: HttpServletRequest,
        response: HttpServletResponse,
        host: String
    ): Boolean {
        // 서브도메인 추출
        val subdomain = extractSubdomain(host)
        if (subdomain == null) {
            throw InvalidSubdomainException(host)
        }

        // 팀 정보 조회 및 검증
        val team = try {
            subdomainService.getTeamBySubdomain(subdomain)
        } catch (e: TeamNotFoundException) {
            logger.warn("Team not found for subdomain: $subdomain (host: $host)")
            securityEventLogger.logSecurityEvent(
                SecurityEvent.UNKNOWN_SUBDOMAIN_ACCESS,
                request,
                mapOf("subdomain" to subdomain, "host" to host, "error" to (e.message ?: "Unknown error"))
            )

            // 개발 환경에서는 404 대신 더 친화적인 에러 응답
            if (host.contains("localhost")) {
                response.status = HttpStatus.NOT_FOUND.value()
                response.contentType = "application/json"
                response.writer.write("""
                    {
                        "success": false,
                        "error": {
                            "code": "TEAM_NOT_FOUND",
                            "message": "서브도메인 '$subdomain'에 해당하는 팀을 찾을 수 없습니다.",
                            "suggestions": [
                                "사용 가능한 서브도메인: admin.localhost:3000 (관리자)",
                                "또는 localhost:3000 (메인 페이지)"
                            ]
                        }
                    }
                """.trimIndent())
                return false
            }

            throw e
        }

        if (team == null) {
            logger.warn("Team is null for subdomain: $subdomain (host: $host)")
            securityEventLogger.logSecurityEvent(
                SecurityEvent.UNKNOWN_SUBDOMAIN_ACCESS,
                request,
                mapOf("subdomain" to subdomain, "host" to host)
            )
            throw TeamNotFoundException(subdomain)
        }

        // 테넌트 컨텍스트 설정
        TenantContextHolder.setContext(
            TenantContext(
                teamId = team.id,
                subdomain = subdomain,
                teamName = team.name,
                host = host
            )
        )

        // API 경로 검증 (선택사항)
        val uri = request.requestURI
        if (uri.startsWith("/api/admin/")) {
            securityEventLogger.logSecurityEvent(
                SecurityEvent.TENANT_ADMIN_ACCESS_ATTEMPT,
                request,
                mapOf("subdomain" to subdomain, "uri" to uri)
            )
            throw SubdomainAccessDeniedException(subdomain, uri)
        }

        logger.debug("Tenant access granted for team ${team.name} (${subdomain})")
        return true
    }

    private fun isValidHost(host: String): Boolean {
        // 개발 환경에서는 localhost 관련 모든 도메인 허용
        if (host.contains("localhost") || host.contains("127.0.0.1")) {
            logger.debug("Development host allowed: $host")
            return true
        }

        // 프로덕션 환경에서는 엄격한 검증
        return allowedHostPatterns.any { pattern ->
            when {
                pattern.startsWith("*") -> {
                    val domain = pattern.removePrefix("*")
                    host.endsWith(domain)
                }
                else -> host.equals(pattern, ignoreCase = true)
            }
        }
    }

    private fun isAdminDomain(host: String): Boolean {
        return host.startsWith("admin.") || host == "admin.localhost:3000" || host == "admin.localhost:8082"
    }

    private fun isMainDomain(host: String): Boolean {
        return host == "localhost:3000" ||
               host == "localhost:8082" ||
               host == "football-club.kr" ||
               host == "footballclub.com"
    }

    private fun extractSubdomain(host: String): String? {
        return when {
            // 개발 환경: 서브도메인이 있는 경우 (예: team.localhost:3000)
            host.contains(".localhost:") -> {
                val subdomain = host.split(".")[0].takeIf { it.isNotBlank() }
                logger.debug("Extracted subdomain from localhost: $subdomain (host: $host)")
                subdomain
            }
            // 개발 환경: 서브도메인이 없는 경우 (예: localhost:3000)
            host.startsWith("localhost:") -> {
                logger.debug("Main localhost domain, no subdomain (host: $host)")
                null
            }
            // 프로덕션 환경: 메인 도메인
            host == "football-club.kr" -> null
            // 프로덕션 환경: 관리자 도메인
            host.startsWith("admin.") -> null
            // 프로덕션 환경: 서브도메인이 있는 경우
            host.contains(".football-club.kr") -> {
                host.split(".")[0].takeIf { it.isNotBlank() && it != "www" }
            }
            else -> {
                logger.debug("Unknown host pattern: $host")
                null
            }
        }
    }

    override fun afterCompletion(
        request: HttpServletRequest,
        response: HttpServletResponse,
        handler: Any,
        ex: Exception?
    ) {
        // 테넌트 컨텍스트 정리
        TenantContextHolder.clear()

        if (ex != null) {
            logger.error("Request completed with exception: ${ex.message}", ex)
        }
    }
}
