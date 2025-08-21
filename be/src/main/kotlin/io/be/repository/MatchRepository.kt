package io.be.repository

import io.be.entity.Match
import io.be.entity.MatchStatus
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

@Repository
interface MatchRepository : JpaRepository<Match, Long> {
    
    fun findByHomeTeamIdOrAwayTeamId(homeTeamId: Long, awayTeamId: Long, pageable: Pageable): Page<Match>
    
    fun findByStatus(status: MatchStatus, pageable: Pageable): Page<Match>
    
    @Query("SELECT m FROM Match m WHERE m.homeTeam.id = :teamId OR m.awayTeam.id = :teamId ORDER BY m.matchDate DESC")
    fun findByTeamId(@Param("teamId") teamId: Long, pageable: Pageable): Page<Match>
    
    @Query("SELECT m FROM Match m WHERE (m.homeTeam.id = :teamId OR m.awayTeam.id = :teamId) AND m.matchDate >= :fromDate ORDER BY m.matchDate ASC")
    fun findUpcomingMatchesByTeam(@Param("teamId") teamId: Long, @Param("fromDate") fromDate: LocalDateTime): List<Match>
    
    @Query("SELECT m FROM Match m WHERE (m.homeTeam.id = :teamId OR m.awayTeam.id = :teamId) AND m.status = :status ORDER BY m.matchDate DESC")
    fun findByTeamIdAndStatus(@Param("teamId") teamId: Long, @Param("status") status: MatchStatus, pageable: Pageable): Page<Match>
    
    @Query("SELECT m FROM Match m WHERE m.stadium.id = :stadiumId ORDER BY m.matchDate DESC")
    fun findByStadiumId(@Param("stadiumId") stadiumId: Long, pageable: Pageable): Page<Match>
    
    @Query("SELECT m FROM Match m WHERE m.matchDate BETWEEN :startDate AND :endDate ORDER BY m.matchDate ASC")
    fun findByMatchDateBetween(@Param("startDate") startDate: LocalDateTime, @Param("endDate") endDate: LocalDateTime): List<Match>
    
    fun countByHomeTeamIdOrAwayTeamId(homeTeamId: Long, awayTeamId: Long): Long
    
    fun countByHomeTeamIdAndStatus(teamId: Long, status: MatchStatus): Long
    fun countByAwayTeamIdAndStatus(teamId: Long, status: MatchStatus): Long
}