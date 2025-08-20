package io.be.config

import org.springframework.stereotype.Component
import java.util.regex.Pattern

@Component
class SubdomainResolver {
    
    companion object {
        private val TEAM_PATTERN = Pattern.compile("^([a-zA-Z0-9-]+)\\.footballclub\\.com$")
        private const val ADMIN_PREFIX = "admin."
    }
    
    fun extractTeamFromHost(host: String): String? {
        val matcher = TEAM_PATTERN.matcher(host)
        return if (matcher.matches()) matcher.group(1) else null
    }
    
    fun isAdminSubdomain(host: String): Boolean {
        return host.startsWith(ADMIN_PREFIX)
    }
    
    fun isLocalhost(host: String): Boolean {
        return host.contains("localhost") || host.contains("127.0.0.1")
    }
}