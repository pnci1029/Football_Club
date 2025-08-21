package io.be.repository

import io.be.entity.Player
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface PlayerRepository : JpaRepository<Player, Long> {
    fun findByTeamId(teamId: Long, pageable: Pageable): Page<Player>
    fun findByTeamIdAndIsActiveTrue(teamId: Long): List<Player>
    fun findByIdAndTeamId(id: Long, teamId: Long): Player?
    fun findByTeamIdAndPosition(teamId: Long, position: String): List<Player>
    fun findByTeamIdAndNameContaining(teamId: Long, name: String): List<Player>
    fun findByTeamIdAndBackNumber(teamId: Long, backNumber: Int): Player?
    fun countByTeamId(teamId: Long): Long
    fun countByTeamIdAndIsActiveTrue(teamId: Long): Long
}