package io.be.match.application

import io.be.match.dto.CreateMatchRequest
import io.be.match.dto.MatchDto
import io.be.match.dto.UpdateMatchRequest
import io.be.match.domain.Match
import io.be.match.domain.MatchStatus
import io.be.shared.exception.MatchNotFoundException
import io.be.shared.exception.StadiumNotFoundException
import io.be.shared.exception.TeamNotFoundException
import io.be.match.domain.MatchRepository
import io.be.stadium.domain.StadiumRepository
import io.be.team.domain.TeamRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
@Transactional(readOnly = true)
class MatchService(
    private val matchRepository: MatchRepository,
    private val teamRepository: TeamRepository,
    private val stadiumRepository: StadiumRepository
) {
    
    fun findAllMatches(pageable: Pageable): Page<MatchDto> {
        return matchRepository.findAll(pageable).map { MatchDto.from(it) }
    }
    
    fun findMatchesByStatus(status: MatchStatus, pageable: Pageable): Page<MatchDto> {
        return matchRepository.findByStatus(status, pageable).map { MatchDto.from(it) }
    }
    
    fun findMatchesByTeam(teamId: Long, pageable: Pageable): Page<MatchDto> {
        return matchRepository.findByTeamId(teamId, pageable).map { MatchDto.from(it) }
    }
    
    fun findMatchesByTeamAndStatus(teamId: Long, status: MatchStatus, pageable: Pageable): Page<MatchDto> {
        return matchRepository.findByTeamIdAndStatus(teamId, status, pageable).map { MatchDto.from(it) }
    }
    
    fun findMatchesByStadium(stadiumId: Long, pageable: Pageable): Page<MatchDto> {
        return matchRepository.findByStadiumId(stadiumId, pageable).map { MatchDto.from(it) }
    }
    
    fun findUpcomingMatches(teamId: Long): List<MatchDto> {
        return matchRepository.findUpcomingMatchesByTeam(teamId, LocalDateTime.now())
            .map { MatchDto.from(it) }
    }
    
    fun findMatchById(id: Long): MatchDto? {
        return matchRepository.findById(id).orElse(null)?.let { MatchDto.from(it) }
    }
    
    @Transactional
    fun createMatch(request: CreateMatchRequest): MatchDto {
        val homeTeam = teamRepository.findById(request.homeTeamId)
            .orElseThrow { TeamNotFoundException(request.homeTeamId) }
        val awayTeam = teamRepository.findById(request.awayTeamId)
            .orElseThrow { TeamNotFoundException(request.awayTeamId) }
        val stadium = stadiumRepository.findById(request.stadiumId)
            .orElseThrow { StadiumNotFoundException(request.stadiumId) }
        
        val match = Match(
            homeTeam = homeTeam,
            awayTeam = awayTeam,
            stadium = stadium,
            matchDate = request.matchDate
        )
        
        val savedMatch = matchRepository.save(match)
        return MatchDto.from(savedMatch)
    }
    
    @Transactional
    fun updateMatch(id: Long, request: UpdateMatchRequest): MatchDto {
        val match = matchRepository.findById(id)
            .orElseThrow { MatchNotFoundException(id) }
        
        val updatedMatch = match.copy(
            matchDate = request.matchDate ?: match.matchDate,
            homeTeamScore = request.homeTeamScore ?: match.homeTeamScore,
            awayTeamScore = request.awayTeamScore ?: match.awayTeamScore,
            status = request.status ?: match.status,
            updatedAt = LocalDateTime.now()
        )
        
        val savedMatch = matchRepository.save(updatedMatch)
        return MatchDto.from(savedMatch)
    }
    
    @Transactional
    fun updateMatchScore(matchId: Long, homeScore: Int, awayScore: Int): MatchDto {
        val match = matchRepository.findById(matchId)
            .orElseThrow { MatchNotFoundException(matchId) }
        
        val updatedMatch = match.copy(
            homeTeamScore = homeScore,
            awayTeamScore = awayScore,
            status = MatchStatus.COMPLETED,
            updatedAt = LocalDateTime.now()
        )
        
        val savedMatch = matchRepository.save(updatedMatch)
        return MatchDto.from(savedMatch)
    }
    
    @Transactional
    fun updateMatchStatus(id: Long, status: MatchStatus): MatchDto {
        val match = matchRepository.findById(id)
            .orElseThrow { MatchNotFoundException(id) }
        
        val updatedMatch = match.copy(
            status = status,
            updatedAt = LocalDateTime.now()
        )
        
        val savedMatch = matchRepository.save(updatedMatch)
        return MatchDto.from(savedMatch)
    }
    
    @Transactional
    fun deleteMatch(id: Long) {
        if (!matchRepository.existsById(id)) {
            throw MatchNotFoundException(id)
        }
        matchRepository.deleteById(id)
    }
}