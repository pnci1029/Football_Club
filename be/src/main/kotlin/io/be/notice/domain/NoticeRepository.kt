package io.be.notice.domain

import io.be.notice.domain.Notice
import io.be.notice.domain.NoticeComment
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface NoticeRepository : JpaRepository<Notice, Long>, NoticeRepositoryCustom {
    
    /**
     * 특정 팀의 활성화된 공지사항 목록 조회 (페이징)
     */
    fun findByTeamIdAndIsActiveTrueOrderByCreatedAtDesc(
        teamId: Long,
        pageable: Pageable
    ): Page<Notice>
    
    
    /**
     * 특정 팀의 특정 공지사항 조회 (활성화된 것만)
     */
    fun findByIdAndTeamIdAndIsActiveTrue(id: Long, teamId: Long): Notice?
    
    
    
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
     * 전체 노출 설정된 활성화된 공지사항 목록 조회 (메인 페이지용)
     */
    fun findByIsActiveTrueAndIsGlobalVisibleTrueOrderByCreatedAtDesc(pageable: Pageable): Page<Notice>
    
}

@Repository
interface NoticeCommentRepository : JpaRepository<NoticeComment, Long>, NoticeCommentRepositoryCustom {
    
    /**
     * 특정 공지사항의 활성화된 댓글 목록 조회
     */
    fun findByNoticeIdAndIsActiveTrueOrderByCreatedAtAsc(noticeId: Long): List<NoticeComment>
    
    /**
     * 특정 공지사항의 댓글 수 조회
     */
    fun countByNoticeIdAndIsActiveTrue(noticeId: Long): Long
    
}