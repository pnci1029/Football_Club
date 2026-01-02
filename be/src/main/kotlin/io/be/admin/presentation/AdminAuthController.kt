package io.be.admin.presentation

import io.be.admin.application.AdminAuthService
import io.be.admin.dto.LoginResponse
import io.be.admin.dto.TokenResponse
import io.be.admin.dto.AdminInfo
import io.be.admin.dto.LoginRequest
import io.be.admin.dto.RefreshTokenRequest
import io.be.admin.dto.LogoutRequest
import io.be.admin.dto.ValidateTokenRequest
import io.be.admin.dto.TokenValidationResponse
import io.be.shared.exception.UnauthorizedException
import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v1/admin/auth")
@CrossOrigin(origins = ["*"])
class AdminAuthController(
    private val adminAuthService: AdminAuthService
) {

    /**
     * 관리자 로그인
     */
    @PostMapping("/login")
    fun login(
        @RequestBody request: LoginRequest,
        httpRequest: HttpServletRequest
    ): ResponseEntity<LoginResponse> {
        val clientIp = getClientIpAddress(httpRequest)

        val response = adminAuthService.login(
            username = request.username,
            password = request.password,
            request = httpRequest,
            teamCode = request.teamCode,
            clientIp = clientIp
        )

        return ResponseEntity.ok(response)
    }

    /**
     * 토큰 갱신
     */
    @PostMapping("/refresh")
    fun refreshToken(
        @RequestBody request: RefreshTokenRequest
    ): ResponseEntity<TokenResponse> {
        val response = adminAuthService.refreshToken(request.refreshToken)
        return ResponseEntity.ok(response)
    }

    /**
     * 현재 로그인한 관리자 정보 조회
     */
    @GetMapping("/me")
    fun getCurrentAdmin(
        @RequestHeader("Authorization") authHeader: String
    ): ResponseEntity<AdminInfo> {
        val token = authHeader.removePrefix("Bearer ")
        val adminInfo = adminAuthService.getAdminByToken(token)
            ?: throw UnauthorizedException("Invalid or expired token")

        return ResponseEntity.ok(adminInfo)
    }

    /**
     * 로그아웃
     */
    @PostMapping("/logout")
    fun logout(
        @RequestBody request: LogoutRequest,
        httpRequest: HttpServletRequest
    ): ResponseEntity<String> {
        val clientIp = getClientIpAddress(httpRequest)

        adminAuthService.logout(
            username = request.username,
            clientIp = clientIp
        )

        return ResponseEntity.ok("Logout successful")
    }

    /**
     * 토큰 검증
     */
    @PostMapping("/validate")
    fun validateToken(
        @RequestBody request: ValidateTokenRequest
    ): ResponseEntity<TokenValidationResponse> {
        val adminInfo = adminAuthService.getAdminByToken(request.token)

        val response = if (adminInfo != null) {
            TokenValidationResponse(valid = true, admin = adminInfo)
        } else {
            TokenValidationResponse(valid = false, admin = null)
        }

        return ResponseEntity.ok(response)
    }

    private fun getClientIpAddress(request: HttpServletRequest): String {
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
}
