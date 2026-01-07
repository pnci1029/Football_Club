package io.be.shared.util

import jakarta.servlet.http.HttpServletRequest

object HttpUtils {
    
    /**
     * 클라이언트의 실제 IP 주소를 가져옵니다.
     * 프록시나 로드 밸런서를 고려하여 실제 클라이언트 IP를 추출합니다.
     */
    fun getClientIpAddress(request: HttpServletRequest): String {
        val xForwardedFor = request.getHeader("X-Forwarded-For")
        val xRealIp = request.getHeader("X-Real-IP")
        val xOriginalForwardedFor = request.getHeader("X-Original-Forwarded-For")

        return when {
            !xForwardedFor.isNullOrBlank() -> xForwardedFor.split(",")[0].trim()
            !xRealIp.isNullOrBlank() -> xRealIp.trim()
            !xOriginalForwardedFor.isNullOrBlank() -> xOriginalForwardedFor.trim()
            else -> request.remoteAddr ?: "unknown"
        }
    }

    /**
     * User-Agent 헤더를 안전하게 가져옵니다.
     */
    fun getUserAgent(request: HttpServletRequest): String {
        return request.getHeader("User-Agent") ?: ""
    }

    /**
     * 요청 헤더를 안전하게 가져옵니다.
     */
    fun getHeaderSafely(request: HttpServletRequest, headerName: String): String? {
        return try {
            request.getHeader(headerName)
        } catch (e: Exception) {
            null
        }
    }
}