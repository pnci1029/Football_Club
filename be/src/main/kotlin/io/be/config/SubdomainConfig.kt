package io.be.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.context.annotation.Configuration
import org.springframework.stereotype.Component
import java.util.regex.Pattern

@Configuration
@EnableConfigurationProperties(SubdomainProperties::class)
class SubdomainConfig

@ConfigurationProperties(prefix = "app.subdomain")
data class SubdomainProperties(
    val enabled: Boolean = true,
    val pattern: String = "{team}.footballclub.com"
) {
    fun extractTeamCodeFromHost(host: String): String? {
        if (!enabled) return null
        
        // 로컬 개발 환경 처리
        if (host.startsWith("localhost") || host.startsWith("127.0.0.1")) {
            return extractFromLocalhost(host)
        }
        
        // 프로덕션 환경 처리
        val regex = pattern.replace("{team}", "([a-zA-Z0-9-]+)")
            .replace(".", "\\.")
            .toRegex()
            
        val matchResult = regex.find(host)
        return matchResult?.groupValues?.get(1)
    }
    
    private fun extractFromLocalhost(host: String): String? {
        // localhost:3000?team=teamA 형식에서 추출
        val teamParam = host.substringAfter("team=", "")
        if (teamParam.isNotEmpty()) {
            return teamParam.substringBefore("&").substringBefore("#")
        }
        
        // team-a.localhost:3000 형식에서 추출
        val parts = host.split(".")
        if (parts.size > 1 && parts[0] != "localhost") {
            return parts[0]
        }
        
        return null
    }
    
    fun isAdminSubdomain(host: String): Boolean {
        return host.startsWith("admin.") || host.contains("admin")
    }
    
    fun getTeamSubdomainUrl(teamCode: String): String {
        return pattern.replace("{team}", teamCode)
    }
}

@Component
class SubdomainResolver {
    
    companion object {
        private val TEAM_PATTERN = Pattern.compile("^([a-zA-Z0-9-]+)\\.footballclub\\.com$")
        private const val ADMIN_PREFIX = "admin."
    }
    
    fun extractTeamFromHost(host: String): String? {
        // localhost 개발환경: park.localhost:3000 형식 처리
        if (host.contains("localhost")) {
            val parts = host.split(".")
            if (parts.size > 1 && parts[0] != "localhost" && parts[0].isNotEmpty()) {
                return parts[0]
            }
            return null
        }
        
        // 로컬 테스트용 .local 도메인 처리
        if (host.endsWith(".football-club.local")) {
            val teamCode = host.substringBefore(".football-club.local")
            if (teamCode != "football-club" && teamCode.isNotEmpty()) {
                return teamCode
            }
        }
        
        // 프로덕션용 .footballclub.com 처리
        val matcher = TEAM_PATTERN.matcher(host)
        return if (matcher.matches()) matcher.group(1) else null
    }
    
    fun isAdminSubdomain(host: String): Boolean {
        return host.startsWith(ADMIN_PREFIX) || host.startsWith("admin.football-club.local")
    }
    
    fun isLocalhost(host: String): Boolean {
        return host.contains("localhost") || host.contains("127.0.0.1") || host.endsWith(".local")
    }
}