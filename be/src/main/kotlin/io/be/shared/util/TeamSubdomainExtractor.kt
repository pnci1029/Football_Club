package io.be.shared.util

import io.be.shared.exception.InvalidSubdomainException
import jakarta.servlet.http.HttpServletRequest
import org.springframework.stereotype.Component

@Component
class TeamSubdomainExtractor {

    /**
     * HTTP 요청에서 팀 서브도메인을 추출합니다.
     * 예: team1.localhost -> "team1"
     */
    fun extractFromRequest(request: HttpServletRequest): String {
        // 프론트엔드에서 보낸 X-Team-Subdomain 헤더 우선 확인
        val subdomainHeader = request.getHeader("X-Team-Subdomain")
        if (!subdomainHeader.isNullOrBlank()) {
            println("✅ [TeamSubdomainExtractor] Using subdomain from header: '$subdomainHeader'")
        }

        val host = request.getHeader("Host") ?: request.serverName
        return extractFromHost(host)
    }

    /**
     * 호스트 문자열에서 팀 서브도메인을 추출합니다.
     */
    fun extractFromHost(host: String): String {
        // 포트 번호 제거
        val hostWithoutPort = host.split(":")[0]

        // 개발 환경에서 localhost나 IP 주소만 있는 경우 (서브도메인 없음)
        if (hostWithoutPort == "localhost" ||
            hostWithoutPort == "127.0.0.1" ||
            hostWithoutPort.matches(Regex("^\\d+\\.\\d+\\.\\d+\\.\\d+$"))) {
            throw InvalidSubdomainException(host)
        }

        // 도메인 파트 분리
        val parts = hostWithoutPort.split(".")

        if (parts.size < 2) {
            throw InvalidSubdomainException(host)
        }

        val subdomain = parts[0]

        // 유효하지 않은 서브도메인 체크
        if (subdomain.isEmpty() ||
            subdomain == "www" ||
            subdomain == "admin" ||
            subdomain == "api") {
            throw InvalidSubdomainException(host)
        }

        return subdomain
    }

    /**
     * 유효한 팀 서브도메인인지 확인합니다.
     */
    fun isValidTeamSubdomain(subdomain: String): Boolean {
        return try {
            subdomain.isNotEmpty() &&
            subdomain != "www" &&
            subdomain != "admin" &&
            subdomain != "api" &&
            subdomain.matches(Regex("^[a-zA-Z0-9-]+$"))
        } catch (e: Exception) {
            false
        }
    }
}
