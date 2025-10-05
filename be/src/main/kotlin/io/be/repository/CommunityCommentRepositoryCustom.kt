package io.be.repository

import io.be.entity.CommunityComment

interface CommunityCommentRepositoryCustom {
    
    // 특정 댓글 조회 (팀 ID로 보안 체크)
    fun findByIdAndTeamId(commentId: Long, teamId: Long): CommunityComment?
}