package io.be.service

import io.be.dto.CreateTeamRequest
import io.be.dto.TeamDto
import io.be.dto.UpdateTeamRequest
import io.be.entity.Team
import io.be.repository.TeamRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class TeamService(
    private val teamRepository: TeamRepository,
    private val playerRepository: io.be.repository.PlayerRepository,
    private val stadiumRepository: io.be.repository.StadiumRepository
) {

    fun findAllTeams(pageable: Pageable): Page<TeamDto> {
        return teamRepository.findAll(pageable).map { TeamDto.from(it) }
    }

    fun getAllTeams(): List<TeamDto> {
        return teamRepository.findAll().map { TeamDto.from(it) }
    }

    fun findTeamById(id: Long): TeamDto? {
        return teamRepository.findById(id).orElse(null)?.let { TeamDto.from(it) }
    }

    fun findTeamById(id: String): TeamDto? {
        return try {
            findTeamById(id.toLong())
        } catch (e: NumberFormatException) {
            null
        }
    }

    fun findTeamByCode(code: String): TeamDto? {
        return teamRepository.findByCode(code)?.let { TeamDto.from(it) }
    }

    @Transactional
    fun createTeam(request: CreateTeamRequest): TeamDto {
        if (teamRepository.findByCode(request.code) != null) {
            throw io.be.exception.TeamCodeAlreadyExistsException(request.code)
        }

        val team = Team(
            code = request.code,
            name = request.name,
            description = request.description,
            logoUrl = request.logoUrl
        )

        val savedTeam = teamRepository.save(team)
        return TeamDto.from(savedTeam)
    }

    @Transactional
    fun updateTeam(id: Long, request: UpdateTeamRequest): TeamDto {
        val team = teamRepository.findById(id).orElseThrow {
            io.be.exception.TeamNotFoundException(id)
        }

        val updatedTeam = team.copy(
            name = request.name ?: team.name,
            description = request.description ?: team.description,
            logoUrl = request.logoUrl ?: team.logoUrl
        )

        val savedTeam = teamRepository.save(updatedTeam)
        return TeamDto.from(savedTeam)
    }

    @Transactional
    fun deleteTeam(id: Long) {
        if (!teamRepository.existsById(id)) {
            throw io.be.exception.TeamNotFoundException(id)
        }
        teamRepository.deleteById(id)
    }
    
    fun getTeamStats(teamId: Long): Map<String, Any> {
        val team = teamRepository.findById(teamId).orElseThrow {
            io.be.exception.TeamNotFoundException(teamId)
        }
        
        val playerCount = playerRepository.countByTeamId(teamId)
        val stadiumCount = stadiumRepository.countByTeamId(teamId)
        
        return mapOf(
            "teamId" to teamId,
            "teamName" to team.name,
            "teamCode" to team.code,
            "playerCount" to playerCount,
            "stadiumCount" to stadiumCount,
            "totalMatches" to 0, // TODO: Match 엔티티 구현 후 추가
            "recentActivity" to "최근 활동 없음" // TODO: 실제 활동 로그 구현 후 추가
        )
    }
    
    fun getAllTeamsStats(): Map<String, Any> {
        val allTeams = teamRepository.findAll()
        val totalPlayers = playerRepository.count()
        val totalStadiums = stadiumRepository.count()
        
        val teamStats = allTeams.map { team ->
            mapOf(
                "id" to team.id,
                "name" to team.name,
                "code" to team.code,
                "playerCount" to playerRepository.countByTeamId(team.id),
                "stadiumCount" to stadiumRepository.countByTeamId(team.id)
            )
        }
        
        return mapOf(
            "totalTeams" to allTeams.size,
            "totalPlayers" to totalPlayers,
            "totalStadiums" to totalStadiums,
            "totalMatches" to 0, // TODO: Match 엔티티 구현 후 추가
            "teams" to teamStats
        )
    }
}
