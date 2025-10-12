package io.be.admin.application

import io.be.admin.domain.Admin
import io.be.admin.domain.AdminLevel
import io.be.admin.dto.LoginResponse
import io.be.admin.dto.TokenResponse
import io.be.admin.dto.AdminInfo
import io.be.shared.exception.UnauthorizedAccessException
import io.be.shared.exception.InvalidRequestException
import io.be.admin.domain.AdminRepository
import io.be.shared.security.JwtTokenProvider
import io.be.shared.util.TeamSubdomainExtractor
import org.slf4j.LoggerFactory
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import jakarta.servlet.http.HttpServletRequest
import java.time.LocalDateTime

@Service
@Transactional
class AdminAuthService(
    private val adminRepository: AdminRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtTokenProvider: JwtTokenProvider,
    private val teamSubdomainExtractor: TeamSubdomainExtractor
) {

    private val logger = LoggerFactory.getLogger(AdminAuthService::class.java)

    /**
     * 관리자 로그인 (서브도메인 제한 포함)
     */
    fun login(username: String, password: String, request: HttpServletRequest, teamCode: String? = null, clientIp: String = "unknown"): LoginResponse {

        // 입력 검증
        if (username.isBlank() || password.isBlank()) {
            throw InvalidRequestException("username", username, "Username and password are required")
        }

        // teamCode가 제공된 경우 이를 우선 사용, 그렇지 않으면 기존 서브도메인 추출 방식 사용
        val currentSubdomain = when {
            !teamCode.isNullOrBlank() -> {
                teamCode
            }
            else -> {
                try {
                    teamSubdomainExtractor.extractFromRequest(request)
                } catch (e: Exception) {
                    null // 서브도메인이 없는 경우 (마스터 관리자만 접근 가능)
                }
            }
        }
        // 관리자 조회 (서브도메인별 분기)
        val admin = findAdminBySubdomain(username, currentSubdomain)
            ?: run {
                logger.warn("Login attempt with invalid username: $username from subdomain: $currentSubdomain, IP: $clientIp")
                throw UnauthorizedAccessException("Invalid username or password")
            }

        // 서브도메인 접근 권한 검증
        validateSubdomainAccess(admin, currentSubdomain, clientIp)

        // 비밀번호 검증
        if (!passwordEncoder.matches(password, admin.password)) {
            logger.warn("Login attempt with invalid password for user: $username from subdomain: $currentSubdomain, IP: $clientIp")
            throw UnauthorizedAccessException("Invalid username or password")
        }

        // 토큰 생성 (서브도메인 정보 포함)
        val accessToken = jwtTokenProvider.createAccessToken(admin.id, admin.username, admin.role)
        val refreshToken = jwtTokenProvider.createRefreshToken(admin.id)

        // 마지막 로그인 시간 업데이트
        adminRepository.updateLastLoginTime(admin.id, LocalDateTime.now())

        // 성공 로그
        logger.info("Successful admin login: $username from subdomain: $currentSubdomain, IP: $clientIp")

        return LoginResponse(
            accessToken = accessToken,
            refreshToken = refreshToken,
            admin = AdminInfo.from(admin)
        )
    }

    /**
     * 하위 호환성을 위한 기존 login 메서드 (Deprecated)
     */
    @Deprecated("Use login with HttpServletRequest parameter")
    fun login(username: String, password: String, clientIp: String = "unknown"): LoginResponse {
        // 마스터 관리자만 조회 (하위 호환성)
        val admin = adminRepository.findByUsernameAndAdminLevelAndIsActive(username, AdminLevel.MASTER, true)
            ?: throw UnauthorizedAccessException("Invalid username or password")

        if (!passwordEncoder.matches(password, admin.password)) {
            throw UnauthorizedAccessException("Invalid username or password")
        }

        val accessToken = jwtTokenProvider.createAccessToken(admin.id, admin.username, admin.role)
        val refreshToken = jwtTokenProvider.createRefreshToken(admin.id)

        adminRepository.updateLastLoginTime(admin.id, LocalDateTime.now())

        return LoginResponse(
            accessToken = accessToken,
            refreshToken = refreshToken,
            admin = AdminInfo.from(admin)
        )
    }

    /**
     * 서브도메인에 따른 관리자 조회
     */
    private fun findAdminBySubdomain(username: String, currentSubdomain: String?): Admin? {
        return when (currentSubdomain) {
            null -> {
                // 서브도메인이 없는 경우: 마스터 관리자만 로그인 가능
                adminRepository.findByUsernameAndAdminLevelAndIsActive(username, AdminLevel.MASTER, true)
            }
            else -> {
                // 서브도메인이 있는 경우: 해당 서브도메인 관리자 또는 마스터 관리자
                adminRepository.findByUsernameAndTeamSubdomainAndIsActive(username, currentSubdomain, true)
                    ?: adminRepository.findByUsernameAndAdminLevelAndIsActive(username, AdminLevel.MASTER, true)
            }
        }
    }

    /**
     * 서브도메인 접근 권한 검증
     */
    private fun validateSubdomainAccess(admin: Admin, currentSubdomain: String?, clientIp: String) {
        when (admin.adminLevel) {
            AdminLevel.MASTER -> {
                // 마스터 관리자는 모든 서브도메인 접근 가능
                logger.debug("Master admin ${admin.username} accessing subdomain: $currentSubdomain")
            }
            AdminLevel.SUBDOMAIN -> {
                // 서브도메인 관리자는 해당 서브도메인에서만 접근 가능
                if (admin.teamSubdomain != currentSubdomain) {
                    logger.warn("Subdomain admin ${admin.username} attempted to access wrong subdomain. Expected: ${admin.teamSubdomain}, Actual: $currentSubdomain, IP: $clientIp")
                    throw UnauthorizedAccessException("Access denied for this subdomain")
                }
            }
        }
    }

    /**
     * 토큰 갱신
     */
    fun refreshToken(refreshToken: String): TokenResponse {

        // 리프레시 토큰 검증
        if (!jwtTokenProvider.validateToken(refreshToken) || !jwtTokenProvider.isRefreshToken(refreshToken)) {
            throw UnauthorizedAccessException("Invalid refresh token")
        }

        val adminId = jwtTokenProvider.getAdminIdFromToken(refreshToken)
        val admin = adminRepository.findById(adminId).orElse(null)
            ?: throw UnauthorizedAccessException("Admin not found")

        if (!admin.isActive) {
            throw UnauthorizedAccessException("Admin account is deactivated")
        }

        // 새 Access Token 생성
        val newAccessToken = jwtTokenProvider.createAccessToken(admin.id, admin.username, admin.role)

        return TokenResponse(
            accessToken = newAccessToken,
            refreshToken = refreshToken // 기존 리프레시 토큰 재사용
        )
    }

    /**
     * 토큰으로 관리자 정보 조회
     */
    @Transactional(readOnly = true)
    fun getAdminByToken(token: String): AdminInfo? {
        return try {
            if (!jwtTokenProvider.validateToken(token) || !jwtTokenProvider.isAccessToken(token)) {
                return null
            }

            val adminId = jwtTokenProvider.getAdminIdFromToken(token)
            val admin = adminRepository.findById(adminId).orElse(null)

            if (admin?.isActive == true) {
                AdminInfo.from(admin)
            } else {
                null
            }
        } catch (e: Exception) {
            logger.warn("Error getting admin by token", e)
            null
        }
    }

    /**
     * 로그아웃 (토큰 블랙리스트 추가는 나중에 구현)
     */
    fun logout(username: String, clientIp: String = "unknown") {
        logger.info("Admin logout: $username from IP: $clientIp")
    }
}

