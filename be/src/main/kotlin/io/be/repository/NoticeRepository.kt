package io.be.repository

import io.be.entity.Notice
import io.be.entity.NoticeComment
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface NoticeRepository : JpaRepository<Notice, Long> {
    
    /**
     * 특정 팀의 활성화된 공지사항 목록 조회 (페이징)
     */
    fun findByTeamIdAndIsActiveTrueOrderByCreatedAtDesc(
        teamId: Long,
        pageable: Pageable
    ): Page<Notice>
    
    /**
     * 특정 팀의 공지사항 검색 (제목 + 내용)
     */
    @Query("""
        SELECT n FROM Notice n 
        WHERE n.teamId = :teamId 
        AND n.isActive = true 
        AND (n.title LIKE %:keyword% OR n.content LIKE %:keyword%)
        ORDER BY n.createdAt DESC
    """)
    fun findByTeamIdAndKeyword(
        @Param("teamId") teamId: Long,
        @Param("keyword") keyword: String,
        pageable: Pageable
    ): Page<Notice>
    
    /**
     * 특정 팀의 특정 공지사항 조회 (활성화된 것만)
     */
    fun findByIdAndTeamIdAndIsActiveTrue(id: Long, teamId: Long): Notice?
    
    /**
     * 조회수 증가
     */
    @Modifying
    @Query("UPDATE Notice n SET n.viewCount = n.viewCount + 1 WHERE n.id = :id")
    fun incrementViewCount(@Param("id") id: Long)
    
    /**
     * 특정 팀의 공지사항 수 조회
     */
    fun countByTeamIdAndIsActiveTrue(teamId: Long): Long
    
    // All Community 관련 메서드들
    
    /**
     * 전체 팀의 활성화된 공지사항 목록 조회 (페이징)
     */
    fun findByIsActiveTrueOrderByCreatedAtDesc(pageable: Pageable): Page<Notice>
    
    /**
     * 특정 팀의 활성화된 공지사항 목록 조회 (페이징) - 간단한 버전
     */
    fun findByTeamIdAndIsActiveTrue(teamId: Long, pageable: Pageable): Page<Notice>
    
    /**
     * 전체 팀에서 키워드 검색
     */
    @Query("""
        SELECT n FROM Notice n 
        WHERE n.isActive = true 
        AND (n.title LIKE %:keyword% OR n.content LIKE %:keyword%)
        ORDER BY n.createdAt DESC
    """)
    fun findByIsActiveTrueAndTitleContainingIgnoreCaseOrContentContainingIgnoreCase(
        @Param("keyword") keyword1: String,
        @Param("keyword") keyword2: String,
        pageable: Pageable
    ): Page<Notice>
    
    /**
     * 특정 팀에서 키워드 검색 - 새 버전
     */
    @Query("""
        SELECT n FROM Notice n 
        WHERE n.teamId = :teamId 
        AND n.isActive = true 
        AND (n.title LIKE %:keyword1% OR n.content LIKE %:keyword2%)
        ORDER BY n.createdAt DESC
    """)
    fun findByTeamIdAndIsActiveTrueAndTitleContainingIgnoreCaseOrContentContainingIgnoreCase(
        @Param("teamId") teamId: Long,
        @Param("keyword1") keyword1: String,
        @Param("keyword2") keyword2: String,
        pageable: Pageable
    ): Page<Notice>
    
    /**
     * 특정 공지사항의 댓글 수 조회 (Cross Repository Query)
     */
    @Query("""
        SELECT COUNT(c) FROM NoticeComment c 
        WHERE c.notice.id = :noticeId 
        AND c.isActive = true
    """)
    fun countCommentsByNoticeId(@Param("noticeId") noticeId: Long): Long
    
    /**
     * 전체 노출 설정된 활성화된 공지사항 목록 조회 (메인 페이지용)
     */
    fun findByIsActiveTrueAndIsGlobalVisibleTrueOrderByCreatedAtDesc(pageable: Pageable): Page<Notice>
    
    /**
     * 전체 노출 설정된 공지사항에서 키워드 검색
     */
    @Query("""
        SELECT n FROM Notice n 
        WHERE n.isActive = true 
        AND n.isGlobalVisible = true
        AND (n.title LIKE %:keyword% OR n.content LIKE %:keyword%)
        ORDER BY n.createdAt DESC
    """)
    fun findByIsActiveTrueAndIsGlobalVisibleTrueAndKeyword(
        @Param("keyword") keyword: String,
        pageable: Pageable
    ): Page<Notice>
}

@Repository
interface NoticeCommentRepository : JpaRepository<NoticeComment, Long> {
    
    /**
     * 특정 공지사항의 활성화된 댓글 목록 조회
     */
    fun findByNoticeIdAndIsActiveTrueOrderByCreatedAtAsc(noticeId: Long): List<NoticeComment>
    
    /**
     * 특정 공지사항의 댓글 수 조회
     */
    fun countByNoticeIdAndIsActiveTrue(noticeId: Long): Long
    
    /**
     * 특정 공지사항의 특정 댓글 조회 (팀 ID로 보안 체크)
     */
    @Query("""
        SELECT c FROM NoticeComment c 
        JOIN c.notice n 
        WHERE c.id = :commentId 
        AND n.teamId = :teamId 
        AND c.isActive = true
    """)
    fun findByIdAndTeamId(
        @Param("commentId") commentId: Long,
        @Param("teamId") teamId: Long
    ): NoticeComment?
}