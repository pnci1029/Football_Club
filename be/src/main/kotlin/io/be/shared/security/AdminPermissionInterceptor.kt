package io.be.shared.security

import io.be.admin.application.AdminAuthService
import io.be.admin.domain.AdminLevel
import io.be.admin.dto.AdminInfo
import io.be.shared.exception.UnauthorizedAccessException
import io.be.shared.util.TeamSubdomainExtractor
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.web.method.HandlerMethod
import org.springframework.web.servlet.HandlerInterceptor

/**
 * 관리자 권한 검증 인터셉터
 * @AdminPermissionRequired 어노테이션이 붙은 API에 대해 권한 검증 수행
 */
@Component
class AdminPermissionInterceptor(
    private val adminAuthService: AdminAuthService,
    private val teamSubdomainExtractor: TeamSubdomainExtractor
) : HandlerInterceptor {

    private val logger = LoggerFactory.getLogger(AdminPermissionInterceptor::class.java)

    override fun preHandle(request: HttpServletRequest, response: HttpServletResponse, handler: Any): Boolean {

        logger.info("인증 정보 요청중")
        // HandlerMethod가 아닌 경우 통과
        if (handler !is HandlerMethod) {
            return true
        }

        // @AdminPermissionRequired 어노테이션 확인
        val annotation = handler.getMethodAnnotation(AdminPermissionRequired::class.java)
            ?: handler.beanType.getAnnotation(AdminPermissionRequired::class.java)
            ?: return true // 어노테이션이 없으면 통과

        // Authorization 헤더에서 토큰 추출
        val authHeader = request.getHeader("Authorization")
        if (authHeader.isNullOrBlank() || !authHeader.startsWith("Bearer ")) {
            logger.warn("Missing or invalid Authorization header for admin API: ${request.requestURI}")
            throw UnauthorizedAccessException("Admin authentication required")
        }

        val token = authHeader.substring(7) // "Bearer " 제거

        // 토큰으로 관리자 정보 조회
        val adminInfo = adminAuthService.getAdminByToken(token)
            ?: run {
                logger.warn("Invalid admin token for API: ${request.requestURI}")
                throw UnauthorizedAccessException("Invalid admin token")
            }

        // 요구되는 관리자 레벨 검증
        if (!hasRequiredLevel(adminInfo, annotation.level)) {
            logger.warn("Insufficient admin level. Required: ${annotation.level}, Actual: ${adminInfo.adminLevel}, Role: ${adminInfo.role}, User: ${adminInfo.username}")
            throw UnauthorizedAccessException("Insufficient admin privileges")
        }

        // 서브도메인 제한 검증 (서브도메인 관리자인 경우)
        if (annotation.enforceSubdomainRestriction && adminInfo.adminLevel == AdminLevel.SUBDOMAIN) {
            validateSubdomainRestriction(adminInfo, request)
        }

        // 요청에 관리자 정보 추가 (컨트롤러에서 사용 가능)
        request.setAttribute("adminInfo", adminInfo)

        logger.debug("Admin permission validated for ${adminInfo.username} (${adminInfo.adminLevel}) on ${request.requestURI}")
        return true
    }

    /**
     * 관리자 레벨 권한 확인
     */
    private fun hasRequiredLevel(adminInfo: AdminInfo, requiredLevel: AdminLevel): Boolean {
        return when (requiredLevel) {
            AdminLevel.SUBDOMAIN -> true // 서브도메인 레벨은 모든 관리자가 가능
            AdminLevel.MASTER -> {
                // 마스터 레벨은 adminLevel이 MASTER이거나 role이 SUPER_ADMIN인 경우 허용
                adminInfo.adminLevel == AdminLevel.MASTER || adminInfo.role == "SUPER_ADMIN"
            }
        }
    }

    /**
     * 서브도메인 제한 검증
     */
    private fun validateSubdomainRestriction(adminInfo: AdminInfo, request: HttpServletRequest) {
        val currentSubdomain = try {
            teamSubdomainExtractor.extractFromRequest(request)
        } catch (e: Exception) {
            logger.warn("Could not extract subdomain for admin restriction validation: ${request.requestURI}")
            throw UnauthorizedAccessException("Invalid subdomain access")
        }

        if (adminInfo.teamSubdomain != currentSubdomain) {
            logger.warn("Subdomain admin ${adminInfo.username} attempted to access wrong subdomain. Expected: ${adminInfo.teamSubdomain}, Actual: $currentSubdomain")
            throw UnauthorizedAccessException("Access denied for this subdomain")
        }
    }
}
