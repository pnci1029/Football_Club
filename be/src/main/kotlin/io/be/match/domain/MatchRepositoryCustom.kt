package io.be.match.domain

import io.be.match.domain.Match
import io.be.match.domain.MatchStatus
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import java.time.LocalDateTime

interface MatchRepositoryCustom {
    
    // 팀 ID로 매치 검색 (홈팀 또는 원정팀)
    fun findByTeamId(teamId: Long, pageable: Pageable): Page<Match>
    
    // 팀의 향후 경기 조회
    fun findUpcomingMatchesByTeam(teamId: Long, fromDate: LocalDateTime): List<Match>
    
    // 팀 ID와 상태로 매치 검색
    fun findByTeamIdAndStatus(teamId: Long, status: MatchStatus, pageable: Pageable): Page<Match>
    
    // 경기장 ID로 매치 검색
    fun findByStadiumId(stadiumId: Long, pageable: Pageable): Page<Match>
    
    // 날짜 범위로 매치 검색
    fun findByMatchDateBetween(startDate: LocalDateTime, endDate: LocalDateTime): List<Match>
}