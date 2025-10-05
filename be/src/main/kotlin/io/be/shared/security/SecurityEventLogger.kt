package io.be.shared.security

import jakarta.servlet.http.HttpServletRequest
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import java.time.Instant

/**
 * 보안 이벤트 로거
 * 보안 관련 이벤트를 체계적으로 로깅하고 모니터링
 */
@Component
class SecurityEventLogger {
    
    private val logger = LoggerFactory.getLogger(SecurityEventLogger::class.java)
    
    /**
     * 보안 이벤트 로깅
     */
    fun logSecurityEvent(
        event: SecurityEvent,
        request: HttpServletRequest,
        additionalInfo: Map<String, Any> = emptyMap()
    ) {
        val logData = buildLogData(event, request, additionalInfo)
        
        when (event.severity) {
            SecurityEvent.Severity.CRITICAL -> logger.error("🚨 CRITICAL SECURITY EVENT: {}", logData)
            SecurityEvent.Severity.HIGH -> logger.error("🔴 HIGH SECURITY EVENT: {}", logData)
            SecurityEvent.Severity.MEDIUM -> logger.warn("🟡 MEDIUM SECURITY EVENT: {}", logData)
            SecurityEvent.Severity.LOW -> logger.info("🟢 LOW SECURITY EVENT: {}", logData)
        }
        
        // 높은 위험도의 이벤트는 추가 조치 필요
        if (event.severity in setOf(SecurityEvent.Severity.CRITICAL, SecurityEvent.Severity.HIGH)) {
            handleHighRiskEvent(event, request, logData)
        }
    }
    
    /**
     * HTTP 요청 없이 보안 이벤트 로깅 (로그인 등)
     */
    fun logSecurityEvent(
        event: SecurityEvent,
        additionalInfo: Map<String, Any> = emptyMap()
    ) {
        val logData = buildLogData(event, additionalInfo)
        
        when (event.severity) {
            SecurityEvent.Severity.CRITICAL -> logger.error("🚨 CRITICAL SECURITY EVENT: {}", logData)
            SecurityEvent.Severity.HIGH -> logger.error("🔴 HIGH SECURITY EVENT: {}", logData)
            SecurityEvent.Severity.MEDIUM -> logger.warn("🟡 MEDIUM SECURITY EVENT: {}", logData)
            SecurityEvent.Severity.LOW -> logger.info("🟢 LOW SECURITY EVENT: {}", logData)
        }
    }
    
    private fun buildLogData(
        event: SecurityEvent,
        request: HttpServletRequest,
        additionalInfo: Map<String, Any>
    ): Map<String, Any> {
        val tenantContext = TenantContextHolder.getContextOrNull()
        
        return mapOf(
            "timestamp" to Instant.now().toString(),
            "event" to event.name,
            "severity" to event.severity.name,
            "description" to event.description,
            "clientIp" to getClientIpAddress(request),
            "userAgent" to (request.getHeader("User-Agent") ?: "Unknown"),
            "host" to (request.getHeader("Host") ?: "Unknown"),
            "method" to request.method,
            "uri" to request.requestURI,
            "queryString" to (request.queryString ?: ""),
            "sessionId" to (request.getSession(false)?.id ?: "No Session"),
            "tenantContext" to (tenantContext?.let {
                mapOf(
                    "teamId" to it.teamId,
                    "subdomain" to it.subdomain,
                    "teamName" to it.teamName
                )
            } ?: "No Context"),
            "additionalInfo" to additionalInfo
        )
    }
    
    private fun buildLogData(
        event: SecurityEvent,
        additionalInfo: Map<String, Any>
    ): Map<String, Any> {
        val tenantContext = TenantContextHolder.getContextOrNull()
        
        return mapOf(
            "timestamp" to Instant.now().toString(),
            "event" to event.name,
            "severity" to event.severity.name,
            "description" to event.description,
            "tenantContext" to (tenantContext?.let {
                mapOf(
                    "teamId" to it.teamId,
                    "subdomain" to it.subdomain,
                    "teamName" to it.teamName
                )
            } ?: "No Context"),
            "additionalInfo" to additionalInfo
        )
    }
    
    private fun getClientIpAddress(request: HttpServletRequest): String {
        // 프록시를 통한 요청의 실제 IP 주소 추출
        val xForwardedFor = request.getHeader("X-Forwarded-For")
        val xRealIp = request.getHeader("X-Real-IP")
        val xOriginalForwardedFor = request.getHeader("X-Original-Forwarded-For")
        
        return when {
            !xForwardedFor.isNullOrBlank() -> xForwardedFor.split(",")[0].trim()
            !xRealIp.isNullOrBlank() -> xRealIp
            !xOriginalForwardedFor.isNullOrBlank() -> xOriginalForwardedFor
            else -> request.remoteAddr
        }
    }
    
    private fun handleHighRiskEvent(
        event: SecurityEvent,
        request: HttpServletRequest,
        logData: Map<String, Any>
    ) {
        // TODO: 실제 운영 환경에서는 다음과 같은 추가 조치 구현 필요
        // 1. 이메일/슬랙 알림
        // 2. IP 차단 (Redis/Database)
        // 3. 보안 대시보드에 실시간 알림
        // 4. 관련 요청 패턴 분석 및 차단
        
        val clientIp = getClientIpAddress(request)
        logger.error("HIGH RISK SECURITY EVENT detected from IP: $clientIp - Event: ${event.name}")
        
        // 예시: 특정 IP의 의심스러운 활동 카운트 (실제로는 Redis나 캐시 사용)
        when (event) {
            SecurityEvent.INVALID_HOST_HEADER,
            SecurityEvent.UNAUTHORIZED_ADMIN_ACCESS,
            SecurityEvent.CROSS_TENANT_ACCESS_ATTEMPT -> {
                logger.warn("Consider blocking IP: $clientIp due to repeated security violations")
            }
            else -> {
                // 기타 이벤트 처리
            }
        }
    }
}

/**
 * 보안 이벤트 정의
 */
enum class SecurityEvent(
    val severity: Severity,
    val description: String
) {
    // Critical - 즉시 대응 필요
    SYSTEM_COMPROMISE(Severity.CRITICAL, "System compromise detected"),
    AUTHENTICATION_BYPASS(Severity.CRITICAL, "Authentication bypass attempt"),
    
    // High - 높은 위험도
    INVALID_HOST_HEADER(Severity.HIGH, "Invalid or suspicious host header"),
    UNAUTHORIZED_ADMIN_ACCESS(Severity.HIGH, "Unauthorized access to admin endpoints"),
    CROSS_TENANT_ACCESS_ATTEMPT(Severity.HIGH, "Cross-tenant data access attempt"),
    MISSING_HOST_HEADER(Severity.HIGH, "Missing host header in request"),
    
    // Medium - 중간 위험도
    UNKNOWN_SUBDOMAIN_ACCESS(Severity.MEDIUM, "Access attempt to unknown subdomain"),
    TENANT_ADMIN_ACCESS_ATTEMPT(Severity.MEDIUM, "Admin API access from tenant subdomain"),
    SUSPICIOUS_API_PATTERN(Severity.MEDIUM, "Suspicious API usage pattern detected"),
    RATE_LIMIT_EXCEEDED(Severity.MEDIUM, "Rate limit exceeded"),
    
    // Low - 낮은 위험도 (정보성)
    VALID_TENANT_ACCESS(Severity.LOW, "Valid tenant access logged"),
    ADMIN_LOGIN_SUCCESS(Severity.LOW, "Admin login successful"),
    ADMIN_LOGOUT(Severity.LOW, "Admin logout"),
    INTERCEPTOR_ERROR(Severity.LOW, "Security interceptor processing error"),
    
    // High - 로그인 실패 (보안 위험)
    ADMIN_LOGIN_FAILURE(Severity.HIGH, "Admin login failed");
    
    enum class Severity {
        CRITICAL,  // 시스템 위험, 즉시 대응
        HIGH,      // 보안 위험, 빠른 대응
        MEDIUM,    // 의심 활동, 모니터링
        LOW        // 정보성 로그
    }
}