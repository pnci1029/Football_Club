package io.be.admin.dto

import io.be.admin.domain.Admin
import io.be.admin.domain.AdminLevel
import jakarta.validation.constraints.NotBlank
import java.time.LocalDateTime

/**
 * 로그인 요청 DTO
 */
data class LoginRequest(
    @field:NotBlank(message = "Username is required")
    val username: String,

    @field:NotBlank(message = "Password is required")
    val password: String,

    val teamCode: String? = null
)

/**
 * 토큰 갱신 요청 DTO
 */
data class RefreshTokenRequest(
    @field:NotBlank(message = "Refresh token is required")
    val refreshToken: String
)

/**
 * 로그아웃 요청 DTO
 */
data class LogoutRequest(
    val username: String
)

/**
 * 토큰 검증 요청 DTO
 */
data class ValidateTokenRequest(
    @field:NotBlank(message = "Token is required")
    val token: String
)

/**
 * 토큰 검증 응답 DTO
 */
data class TokenValidationResponse(
    val valid: Boolean,
    val admin: AdminInfo?
)

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
    val teamSubdomain: String?,
    val adminLevel: AdminLevel,
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
                teamSubdomain = admin.teamSubdomain,
                adminLevel = admin.adminLevel,
                createdAt = admin.createdAt,
                lastLoginAt = admin.lastLoginAt
            )
        }
    }
}