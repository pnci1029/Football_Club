package io.be.repository

import io.be.entity.Team
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Repository
interface TeamRepository : JpaRepository<Team, Long> {
    // 활성 팀만 조회
    fun findByCodeAndIsDeletedFalse(code: String): Team?
    fun findByNameContainingAndIsDeletedFalse(name: String): List<Team>
    fun findAllByIsDeletedFalse(): List<Team>
    fun findAllByIsDeletedFalse(pageable: Pageable): Page<Team>
    
    // N+1 해결을 위한 EntityGraph 적용
    @EntityGraph(attributePaths = ["players"])
    fun findWithPlayersById(id: Long): Team?
    
    @EntityGraph(attributePaths = ["players"])
    fun findWithPlayersByCodeAndIsDeletedFalse(code: String): Team?
    fun existsByCodeAndIsDeletedFalse(code: String): Boolean
    fun existsByNameAndIsDeletedFalse(name: String): Boolean
    
    // 소프트 딜리트
    @Modifying
    @Transactional
    @Query("UPDATE Team t SET t.isDeleted = true, t.deletedAt = :deletedAt WHERE t.id = :id")
    fun softDeleteById(@Param("id") id: Long, @Param("deletedAt") deletedAt: LocalDateTime)
    
    // 기존 메서드들은 호환성을 위해 유지 (deprecated)
    @Deprecated("Use findByCodeAndIsDeletedFalse instead")
    fun findByCode(code: String): Team? = findByCodeAndIsDeletedFalse(code)
    
    @Deprecated("Use findByNameContainingAndIsDeletedFalse instead") 
    fun findByNameContaining(name: String): List<Team> = findByNameContainingAndIsDeletedFalse(name)
    
    @Deprecated("Use existsByCodeAndIsDeletedFalse instead")
    fun existsByCode(code: String): Boolean = existsByCodeAndIsDeletedFalse(code)
    
    @Deprecated("Use existsByNameAndIsDeletedFalse instead")
    fun existsByName(name: String): Boolean = existsByNameAndIsDeletedFalse(name)
}