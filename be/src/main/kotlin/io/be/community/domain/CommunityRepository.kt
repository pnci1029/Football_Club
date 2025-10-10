package io.be.community.domain

import io.be.community.domain.CommunityPost
import io.be.community.domain.CommunityComment
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface CommunityPostRepository : JpaRepository<CommunityPost, Long>, CommunityPostRepositoryCustom {
    
    // 간단한 조회 메서드들 (Spring Data JPA 기본 기능 사용)
    fun findByTeamIdAndIsActiveTrueOrderByCreatedAtDesc(teamId: Long, pageable: Pageable): Page<CommunityPost>
    fun findByTeamIdAndCategoryAndIsActiveTrueOrderByCreatedAtDesc(teamId: Long, category: CommunityCategory, pageable: Pageable): Page<CommunityPost>
    fun findByIdAndTeamIdAndIsActiveTrue(id: Long, teamId: Long): CommunityPost?
    fun countByTeamIdAndIsActiveTrue(teamId: Long): Long
    fun findByIsActiveTrueOrderByCreatedAtDesc(pageable: Pageable): Page<CommunityPost>
    fun findByTeamIdAndIsActiveTrue(teamId: Long, pageable: Pageable): Page<CommunityPost>
    
    // 통계용 메서드들
    fun countByIsActive(isActive: Boolean): Long
    fun countByTeamIdAndIsActive(teamId: Long, isActive: Boolean): Long
    fun findByIsActiveOrderByCreatedAtDesc(isActive: Boolean): List<CommunityPost>
    fun countByIsActiveAndCreatedAtAfter(isActive: Boolean, date: java.time.LocalDateTime): Long
}

@Repository
interface CommunityCommentRepository : JpaRepository<CommunityComment, Long>, CommunityCommentRepositoryCustom {
    
    // 간단한 조회 메서드들 (Spring Data JPA 기본 기능 사용)
    fun findByPostIdAndIsActiveTrueOrderByCreatedAtAsc(postId: Long): List<CommunityComment>
    fun countByPostIdAndIsActiveTrue(postId: Long): Long
    
    // 통계용 메서드들
    fun countByIsActive(isActive: Boolean): Long
    
    @Query("SELECT COUNT(c) FROM CommunityComment c JOIN c.post p WHERE p.teamId = :teamId AND c.isActive = :isActive")
    fun countByTeamIdAndIsActive(@Param("teamId") teamId: Long, @Param("isActive") isActive: Boolean): Long
}