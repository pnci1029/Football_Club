package io.be.repository

import io.be.entity.NoticeComment

interface NoticeCommentRepositoryCustom {
    
    // 특정 공지사항의 특정 댓글 조회 (팀 ID로 보안 체크)
    fun findByIdAndTeamId(commentId: Long, teamId: Long): NoticeComment?
}