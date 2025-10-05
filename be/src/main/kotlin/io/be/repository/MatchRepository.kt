package io.be.repository

import io.be.entity.Match
import io.be.entity.MatchStatus
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

@Repository
interface MatchRepository : JpaRepository<Match, Long>, MatchRepositoryCustom {
    
    fun findByHomeTeamIdOrAwayTeamId(homeTeamId: Long, awayTeamId: Long, pageable: Pageable): Page<Match>
    
    fun findByStatus(status: MatchStatus, pageable: Pageable): Page<Match>
    
    
    fun countByHomeTeamIdOrAwayTeamId(homeTeamId: Long, awayTeamId: Long): Long
    
    fun countByHomeTeamIdAndStatus(teamId: Long, status: MatchStatus): Long
    fun countByAwayTeamIdAndStatus(teamId: Long, status: MatchStatus): Long
}