package io.be.service

import io.be.config.SubdomainResolver
import io.be.dto.TeamDto
import io.be.entity.Team
import io.be.repository.TeamRepository
import jakarta.servlet.http.HttpServletRequest
import org.springframework.stereotype.Service

@Service
class SubdomainService(
    private val teamRepository: TeamRepository,
    private val subdomainResolver: SubdomainResolver
) {
    
    fun getTeamBySubdomain(host: String): TeamDto? {
        // localhost 환경에서는 기본 팀 반환 (개발용)
        if (subdomainResolver.isLocalhost(host)) {
            return teamRepository.findAll().firstOrNull()?.let { TeamDto.from(it) }
        }
        
        val teamCode = subdomainResolver.extractTeamFromHost(host)
        return teamCode?.let { 
            teamRepository.findByCode(it)?.let { team -> TeamDto.from(team) }
        }
    }
    
    fun isAdminRequest(host: String): Boolean {
        return subdomainResolver.isAdminSubdomain(host)
    }
    
    fun extractTeamCodeFromRequest(request: HttpServletRequest): String? {
        val host = request.getHeader("X-Forwarded-Host") 
            ?: request.getHeader("Host") 
            ?: request.serverName
        
        // localhost 환경에서는 기본 팀 코드 반환 (개발용)
        if (subdomainResolver.isLocalhost(host)) {
            return teamRepository.findAll().firstOrNull()?.code
        }
        
        return subdomainResolver.extractTeamFromHost(host)
    }
}