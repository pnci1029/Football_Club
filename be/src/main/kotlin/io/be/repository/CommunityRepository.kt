package io.be.repository

import io.be.entity.CommunityPost
import io.be.entity.CommunityComment
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface CommunityPostRepository : JpaRepository<CommunityPost, Long> {
    
    /**
     * 특정 팀의 활성화된 게시글 목록 조회 (페이징)
     */
    fun findByTeamIdAndIsActiveTrueOrderByIsNoticeDescCreatedAtDesc(
        teamId: Long,
        pageable: Pageable
    ): Page<CommunityPost>
    
    /**
     * 특정 팀의 게시글 검색 (제목 + 내용)
     */
    @Query("""
        SELECT p FROM CommunityPost p 
        WHERE p.teamId = :teamId 
        AND p.isActive = true 
        AND (p.title LIKE %:keyword% OR p.content LIKE %:keyword%)
        ORDER BY p.isNotice DESC, p.createdAt DESC
    """)
    fun findByTeamIdAndKeyword(
        @Param("teamId") teamId: Long,
        @Param("keyword") keyword: String,
        pageable: Pageable
    ): Page<CommunityPost>
    
    /**
     * 특정 팀의 특정 게시글 조회 (활성화된 것만)
     */
    fun findByIdAndTeamIdAndIsActiveTrue(id: Long, teamId: Long): CommunityPost?
    
    /**
     * 조회수 증가
     */
    @Modifying
    @Query("UPDATE CommunityPost p SET p.viewCount = p.viewCount + 1 WHERE p.id = :id")
    fun incrementViewCount(@Param("id") id: Long)
    
    /**
     * 특정 팀의 게시글 수 조회
     */
    fun countByTeamIdAndIsActiveTrue(teamId: Long): Long
}

@Repository
interface CommunityCommentRepository : JpaRepository<CommunityComment, Long> {
    
    /**
     * 특정 게시글의 활성화된 댓글 목록 조회
     */
    fun findByPostIdAndIsActiveTrueOrderByCreatedAtAsc(postId: Long): List<CommunityComment>
    
    /**
     * 특정 게시글의 댓글 수 조회
     */
    fun countByPostIdAndIsActiveTrue(postId: Long): Long
    
    /**
     * 특정 게시글의 특정 댓글 조회 (팀 ID로 보안 체크)
     */
    @Query("""
        SELECT c FROM CommunityComment c 
        JOIN c.post p 
        WHERE c.id = :commentId 
        AND p.teamId = :teamId 
        AND c.isActive = true
    """)
    fun findByIdAndTeamId(
        @Param("commentId") commentId: Long,
        @Param("teamId") teamId: Long
    ): CommunityComment?
}