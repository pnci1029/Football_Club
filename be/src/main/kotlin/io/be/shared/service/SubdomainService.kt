package io.be.shared.service

import io.be.shared.config.SubdomainResolver
import io.be.team.dto.TeamDto
import io.be.team.domain.Team
import io.be.team.domain.TeamRepository
import jakarta.servlet.http.HttpServletRequest
import org.springframework.stereotype.Service

@Service
class SubdomainService(
    private val teamRepository: TeamRepository,
    private val subdomainResolver: SubdomainResolver
) {
    
    fun getTeamBySubdomain(host: String): TeamDto? {
        val teamCode = subdomainResolver.extractTeamFromHost(host)
        return teamCode?.let { 
            teamRepository.findByCode(it)?.let { team -> TeamDto.from(team) }
        }
    }
    
    fun getTeamByCode(teamCode: String): TeamDto? {
        return teamRepository.findByCode(teamCode)?.let { TeamDto.from(it) }
    }
    
    fun isAdminRequest(host: String): Boolean {
        return subdomainResolver.isAdminSubdomain(host)
    }
    
    fun extractTeamCodeFromRequest(request: HttpServletRequest): String? {
        val host = request.getHeader("X-Forwarded-Host") 
            ?: request.getHeader("Host") 
            ?: request.serverName
        
        
        return subdomainResolver.extractTeamFromHost(host)
    }
}