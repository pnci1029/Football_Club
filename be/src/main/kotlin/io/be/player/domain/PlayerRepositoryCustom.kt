package io.be.player.domain

import io.be.player.dto.PlayerStatistics
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import java.time.LocalDateTime

interface PlayerRepositoryCustom {

    // 소프트 딜리트
    fun softDeleteById(id: Long, deletedAt: LocalDateTime)

    // 복합 검색
    fun findPlayersWithFilters(
        teamId: Long,
        position: String? = null,
        search: String? = null,
        isActive: Boolean? = null,
        pageable: Pageable
    ): Page<Player>

    // 선수 통계 조회
    fun getPlayerStatsByTeam(teamId: Long): PlayerStatistics

    // 등번호 중복 체크
    fun existsByTeamIdAndBackNumberAndNotId(teamId: Long, backNumber: Int, excludeId: Long? = null): Boolean
}
