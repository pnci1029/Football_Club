package io.be.service

import io.be.config.SubdomainResolver
import io.be.entity.Team
import io.be.repository.TeamRepository
import org.springframework.stereotype.Service

@Service
class SubdomainService(
    private val teamRepository: TeamRepository,
    private val subdomainResolver: SubdomainResolver
) {
    
    fun getTeamBySubdomain(host: String): Team? {
        // localhost 환경에서는 기본 팀 반환 (개발용)
        if (subdomainResolver.isLocalhost(host)) {
            return teamRepository.findAll().firstOrNull()
        }
        
        val teamCode = subdomainResolver.extractTeamFromHost(host)
        return teamCode?.let { teamRepository.findByCode(it) }
    }
    
    fun isAdminRequest(host: String): Boolean {
        return subdomainResolver.isAdminSubdomain(host)
    }
}