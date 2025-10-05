package io.be.player.domain

import io.be.player.domain.Player
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface PlayerRepository : JpaRepository<Player, Long>, PlayerRepositoryCustom {
    // 활성 선수만 조회 (소프트 딜리트 고려)
    fun findByTeamIdAndIsDeletedFalse(teamId: Long, pageable: Pageable): Page<Player>
    fun findByTeamIdAndIsDeletedFalse(teamId: Long): List<Player>
    fun findByTeamIdAndIsActiveTrueAndIsDeletedFalse(teamId: Long): List<Player>
    fun findByIdAndTeamIdAndIsDeletedFalse(id: Long, teamId: Long): Player?
    fun findByTeamIdAndPositionAndIsDeletedFalse(teamId: Long, position: String): List<Player>
    fun findByTeamIdAndNameContainingAndIsDeletedFalse(teamId: Long, name: String): List<Player>
    fun findByTeamIdAndNameContainingAndIsDeletedFalse(teamId: Long, name: String, pageable: Pageable): Page<Player>
    fun findByTeamIdAndBackNumberAndIsDeletedFalse(teamId: Long, backNumber: Int): Player?
    fun countByTeamIdAndIsDeletedFalse(teamId: Long): Long
    fun countByTeamIdAndIsActiveTrueAndIsDeletedFalse(teamId: Long): Long
    
    
    // 기존 메서드들은 호환성을 위해 유지 (deprecated)
    @Deprecated("Use findByTeamIdAndIsDeletedFalse instead")
    fun findByTeamId(teamId: Long, pageable: Pageable): Page<Player> = findByTeamIdAndIsDeletedFalse(teamId, pageable)
    
    @Deprecated("Use findByTeamIdAndIsDeletedFalse instead")
    fun findByTeamId(teamId: Long): List<Player> = findByTeamIdAndIsDeletedFalse(teamId)
    
    @Deprecated("Use findByTeamIdAndIsActiveTrueAndIsDeletedFalse instead")
    fun findByTeamIdAndIsActiveTrue(teamId: Long): List<Player> = findByTeamIdAndIsActiveTrueAndIsDeletedFalse(teamId)
    
    @Deprecated("Use findByIdAndTeamIdAndIsDeletedFalse instead")
    fun findByIdAndTeamId(id: Long, teamId: Long): Player? = findByIdAndTeamIdAndIsDeletedFalse(id, teamId)
    
    @Deprecated("Use findByTeamIdAndPositionAndIsDeletedFalse instead")
    fun findByTeamIdAndPosition(teamId: Long, position: String): List<Player> = findByTeamIdAndPositionAndIsDeletedFalse(teamId, position)
    
    @Deprecated("Use findByTeamIdAndNameContainingAndIsDeletedFalse instead")
    fun findByTeamIdAndNameContaining(teamId: Long, name: String): List<Player> = findByTeamIdAndNameContainingAndIsDeletedFalse(teamId, name)
    
    @Deprecated("Use findByTeamIdAndBackNumberAndIsDeletedFalse instead")
    fun findByTeamIdAndBackNumber(teamId: Long, backNumber: Int): Player? = findByTeamIdAndBackNumberAndIsDeletedFalse(teamId, backNumber)
    
    @Deprecated("Use countByTeamIdAndIsDeletedFalse instead")
    fun countByTeamId(teamId: Long): Long = countByTeamIdAndIsDeletedFalse(teamId)
    
    @Deprecated("Use countByTeamIdAndIsActiveTrueAndIsDeletedFalse instead")
    fun countByTeamIdAndIsActiveTrue(teamId: Long): Long = countByTeamIdAndIsActiveTrueAndIsDeletedFalse(teamId)
}