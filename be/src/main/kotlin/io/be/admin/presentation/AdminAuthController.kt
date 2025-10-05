package io.be.admin.presentation

import io.be.admin.application.AdminAuthService
import io.be.admin.application.LoginResponse
import io.be.admin.application.TokenResponse
import io.be.admin.application.AdminInfo
import io.be.shared.util.ApiResponse
import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.constraints.NotBlank
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/admin/auth")
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
    ): ResponseEntity<ApiResponse<LoginResponse>> {
        val clientIp = getClientIpAddress(httpRequest)
        
        val response = adminAuthService.login(
            username = request.username,
            password = request.password,
            clientIp = clientIp
        )
        
        return ResponseEntity.ok(ApiResponse.success(response))
    }
    
    /**
     * 토큰 갱신
     */
    @PostMapping("/refresh")
    fun refreshToken(
        @RequestBody request: RefreshTokenRequest
    ): ResponseEntity<ApiResponse<TokenResponse>> {
        val response = adminAuthService.refreshToken(request.refreshToken)
        return ResponseEntity.ok(ApiResponse.success(response))
    }
    
    /**
     * 현재 로그인한 관리자 정보 조회
     */
    @GetMapping("/me")
    fun getCurrentAdmin(
        @RequestHeader("Authorization") authHeader: String
    ): ResponseEntity<ApiResponse<AdminInfo>> {
        val token = authHeader.removePrefix("Bearer ")
        val adminInfo = adminAuthService.getAdminByToken(token)
            ?: return ResponseEntity.status(401)
                .body(ApiResponse.error("UNAUTHORIZED", "Invalid or expired token"))
        
        return ResponseEntity.ok(ApiResponse.success(adminInfo))
    }
    
    /**
     * 로그아웃
     */
    @PostMapping("/logout")
    fun logout(
        @RequestBody request: LogoutRequest,
        httpRequest: HttpServletRequest
    ): ResponseEntity<ApiResponse<String>> {
        val clientIp = getClientIpAddress(httpRequest)
        
        adminAuthService.logout(
            username = request.username,
            clientIp = clientIp
        )
        
        return ResponseEntity.ok(ApiResponse.success("Logout successful"))
    }
    
    /**
     * 토큰 검증
     */
    @PostMapping("/validate")
    fun validateToken(
        @RequestBody request: ValidateTokenRequest
    ): ResponseEntity<ApiResponse<TokenValidationResponse>> {
        val adminInfo = adminAuthService.getAdminByToken(request.token)
        
        val response = if (adminInfo != null) {
            TokenValidationResponse(valid = true, admin = adminInfo)
        } else {
            TokenValidationResponse(valid = false, admin = null)
        }
        
        return ResponseEntity.ok(ApiResponse.success(response))
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

/**
 * 로그인 요청 DTO
 */
data class LoginRequest(
    @field:NotBlank(message = "Username is required")
    val username: String,
    
    @field:NotBlank(message = "Password is required")
    val password: String
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