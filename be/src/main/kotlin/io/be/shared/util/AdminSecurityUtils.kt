package io.be.shared.util

import io.be.admin.dto.AdminInfo
import io.be.admin.domain.AdminLevel
import io.be.shared.exception.UnauthorizedAdminAccessException
import io.be.team.application.TeamService

object AdminSecurityUtils {
    
    /**
     * 관리자의 팀 ID를 안전하게 가져옵니다.
     * MASTER 권한일 경우 요청된 teamId를 사용하고,
     * SUBDOMAIN 권한일 경우 자신의 팀으로 제한합니다.
     */
    fun getAuthorizedTeamId(
        adminInfo: AdminInfo,
        requestedTeamId: Long?,
        teamService: TeamService
    ): Long {
        return when (adminInfo.adminLevel) {
            AdminLevel.MASTER -> {
                requestedTeamId 
                    ?: throw IllegalArgumentException("Master admin requires teamId parameter")
            }
            AdminLevel.SUBDOMAIN -> {
                val team = teamService.findByCode(adminInfo.teamSubdomain!!)
                    ?: throw UnauthorizedAdminAccessException("Invalid team subdomain")

                // 요청한 teamId가 있다면 자신의 팀인지 검증
                if (requestedTeamId != null && requestedTeamId != team.id) {
                    throw UnauthorizedAdminAccessException("Subdomain admin can only access their own team")
                }
                team.id
            }
        }
    }

    /**
     * 서브도메인 관리자가 자신의 팀 리소스에만 접근하는지 검증합니다.
     */
    fun validateSubdomainAccess(
        adminInfo: AdminInfo,
        resourceTeamId: Long,
        teamService: TeamService
    ) {
        if (adminInfo.adminLevel == AdminLevel.SUBDOMAIN) {
            val team = teamService.findByCode(adminInfo.teamSubdomain!!)
                ?: throw UnauthorizedAdminAccessException("Invalid team subdomain")

            if (resourceTeamId != team.id) {
                throw UnauthorizedAdminAccessException("Subdomain admin can only access resources from their own team")
            }
        }
    }

    /**
     * 관리자가 특정 리소스에 접근할 권한이 있는지 확인합니다.
     */
    fun hasAccessToResource(
        adminInfo: AdminInfo,
        resourceTeamId: Long,
        teamService: TeamService
    ): Boolean {
        return try {
            when (adminInfo.adminLevel) {
                AdminLevel.MASTER -> true
                AdminLevel.SUBDOMAIN -> {
                    val team = teamService.findByCode(adminInfo.teamSubdomain!!)
                    team != null && team.id == resourceTeamId
                }
            }
        } catch (e: Exception) {
            false
        }
    }
}