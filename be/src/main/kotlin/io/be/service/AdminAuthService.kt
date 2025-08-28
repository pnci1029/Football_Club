package io.be.service

import io.be.entity.Admin
import io.be.exception.UnauthorizedAccessException
import io.be.exception.InvalidRequestException
import io.be.repository.AdminRepository
import io.be.security.JwtTokenProvider
import org.slf4j.LoggerFactory
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
@Transactional
class AdminAuthService(
    private val adminRepository: AdminRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtTokenProvider: JwtTokenProvider
) {
    
    private val logger = LoggerFactory.getLogger(AdminAuthService::class.java)
    
    /**
     * 관리자 로그인
     */
    fun login(username: String, password: String, clientIp: String = "unknown"): LoginResponse {
        
        // 입력 검증
        if (username.isBlank() || password.isBlank()) {
            throw InvalidRequestException("username", username, "Username and password are required")
        }
        
        // 관리자 조회
        val admin = adminRepository.findByUsernameAndIsActive(username, true)
            ?: run {
                logger.warn("Login attempt with invalid username: $username from IP: $clientIp")
                // 보안상 사용자명이 틀렸는지 비밀번호가 틀렸는지 구분하지 않음
                throw UnauthorizedAccessException("Invalid username or password")
            }
        
        // 비밀번호 검증
        if (!passwordEncoder.matches(password, admin.password)) {
            logger.warn("Login attempt with invalid password for user: $username from IP: $clientIp")
            throw UnauthorizedAccessException("Invalid username or password")
        }
        
        // 토큰 생성
        val accessToken = jwtTokenProvider.createAccessToken(admin.id, admin.username, admin.role)
        val refreshToken = jwtTokenProvider.createRefreshToken(admin.id)
        
        // 마지막 로그인 시간 업데이트
        adminRepository.updateLastLoginTime(admin.id, LocalDateTime.now())
        
        // 성공 로그
        logger.info("Successful admin login: $username from IP: $clientIp")
        
        return LoginResponse(
            accessToken = accessToken,
            refreshToken = refreshToken,
            admin = AdminInfo.from(admin)
        )
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

/**
 * 로그인 응답 DTO
 */
data class LoginResponse(
    val accessToken: String,
    val refreshToken: String,
    val admin: AdminInfo
)

/**
 * 토큰 갱신 응답 DTO
 */
data class TokenResponse(
    val accessToken: String,
    val refreshToken: String
)

/**
 * 관리자 정보 DTO
 */
data class AdminInfo(
    val id: Long,
    val username: String,
    val role: String,
    val email: String?,
    val name: String?,
    val createdAt: LocalDateTime,
    val lastLoginAt: LocalDateTime?
) {
    companion object {
        fun from(admin: Admin): AdminInfo {
            return AdminInfo(
                id = admin.id,
                username = admin.username,
                role = admin.role,
                email = admin.email,
                name = admin.name,
                createdAt = admin.createdAt,
                lastLoginAt = admin.lastLoginAt
            )
        }
    }
}