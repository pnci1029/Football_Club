package io.be.team.application

import io.be.team.dto.CreateTeamRequest
import io.be.team.dto.TeamDto
import io.be.team.dto.UpdateTeamRequest
import io.be.shared.dto.TeamSummaryDto
import io.be.team.domain.Team
import io.be.team.domain.TeamRepository
import io.be.shared.util.logger
// Redis 캐시 기능 비활성화됨
// import org.springframework.cache.annotation.Cacheable
// import org.springframework.cache.annotation.CacheEvict
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
@Transactional(readOnly = true)
class TeamService(
    private val teamRepository: TeamRepository,
    private val playerRepository: io.be.player.domain.PlayerRepository,
    private val stadiumRepository: io.be.stadium.domain.StadiumRepository
) {
    private val logger = logger()

    fun findAllTeams(pageable: Pageable): Page<TeamDto> {
        return teamRepository.findAllByIsDeletedFalse(pageable).map { TeamDto.from(it) }
    }

    // @Cacheable(value = ["teams"], key = "'all'")
    fun getAllTeams(): List<TeamDto> {
        return teamRepository.findAllByIsDeletedFalse().map { TeamDto.from(it) }
    }
    
    // @Cacheable(value = ["teams"], key = "'summary'")
    fun getAllTeamSummaries(): List<TeamSummaryDto> {
        return teamRepository.findAllByIsDeletedFalse().map { TeamSummaryDto.from(it) }
    }

    // @Cacheable(value = ["teams"], key = "#id")
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

    // @Cacheable(value = ["teams"], key = "'code_' + #code")
    fun findTeamByCode(code: String): TeamDto? {
        return teamRepository.findByCodeAndIsDeletedFalse(code)?.let { TeamDto.from(it) }
    }
    
    /**
     * Admin에서 사용할 TeamDto를 반환하는 메서드 (findByCode 별칭)
     */
    fun findByCode(code: String): TeamDto? {
        return findTeamByCode(code)
    }

    @Transactional
    // @CacheEvict(value = ["teams"], allEntries = true)
    fun createTeam(request: CreateTeamRequest): TeamDto {
        logger.info("Creating team with code: ${request.code}")
        
        if (teamRepository.findByCodeAndIsDeletedFalse(request.code) != null) {
            logger.warn("Team code already exists: ${request.code}")
            throw io.be.shared.exception.TeamCodeAlreadyExistsException(request.code)
        }

        val team = Team(
            code = request.code,
            name = request.name,
            description = request.description,
            logoUrl = request.logoUrl
        )

        val savedTeam = teamRepository.save(team)
        logger.info("Team created successfully with id: ${savedTeam.id}")
        return TeamDto.from(savedTeam)
    }

    @Transactional
    // @CacheEvict(value = ["teams"], allEntries = true)
    fun updateTeam(id: Long, request: UpdateTeamRequest): TeamDto {
        val team = teamRepository.findById(id).orElseThrow {
            io.be.shared.exception.TeamNotFoundException(id)
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
        val team = teamRepository.findById(id).orElseThrow {
            io.be.shared.exception.TeamNotFoundException(id)
        }
        
        if (team.isDeleted) {
            throw io.be.shared.exception.TeamNotFoundException(id)
        }
        
        // 소프트 딜리트 수행
        teamRepository.softDeleteById(id, LocalDateTime.now())
    }
    
    fun getTeamStats(teamId: Long): Map<String, Any> {
        val team = teamRepository.findById(teamId).orElseThrow {
            io.be.shared.exception.TeamNotFoundException(teamId)
        }
        
        val playerCount = playerRepository.countByTeamIdAndIsDeletedFalse(teamId)
        val stadiumCount = stadiumRepository.count()
        
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
        val allTeams = teamRepository.findAllByIsDeletedFalse()
        val totalPlayers = playerRepository.count()
        val totalStadiums = stadiumRepository.count()
        
        val teamStats = allTeams.map { team ->
            mapOf(
                "id" to team.id,
                "name" to team.name,
                "code" to team.code,
                "playerCount" to playerRepository.countByTeamIdAndIsDeletedFalse(team.id),
                "stadiumCount" to stadiumRepository.count()
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
