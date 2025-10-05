package io.be.notice.domain

import io.be.notice.domain.Notice
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable

interface NoticeRepositoryCustom {
    
    // 팀별 공지사항 검색 (키워드)
    fun findByTeamIdAndKeyword(teamId: Long, keyword: String, pageable: Pageable): Page<Notice>
    
    // 전체 팀 공지사항 검색 (키워드) - 전체 노출용
    fun findByKeywordAndGlobalVisible(keyword: String, pageable: Pageable): Page<Notice>
    
    // 조회수 증가
    fun incrementViewCount(id: Long)
    
    // 조회수 증가 (지정값)
    fun incrementViewCountBy(id: Long, increment: Long)
    
    // 특정 공지사항의 댓글 수 조회
    fun countCommentsByNoticeId(noticeId: Long): Long
}