package io.be.notice.dto

import io.be.notice.domain.Notice
import io.be.team.domain.Team
import java.time.LocalDateTime

// 전체 공지사항 응답 DTO (팀 정보 포함)
data class AllNoticeResponse(
    val id: Long,
    val title: String,
    val content: String,
    val authorName: String,
    val viewCount: Int,
    val commentCount: Long,
    val isGlobalVisible: Boolean,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
    val teamId: Long,
    val teamName: String,
    val teamSubdomain: String?
) {
    companion object {
        fun from(notice: Notice, team: Team?, commentCount: Long): AllNoticeResponse {
            return AllNoticeResponse(
                id = notice.id,
                title = notice.title,
                content = notice.content,
                authorName = notice.authorName,
                viewCount = notice.viewCount,
                commentCount = commentCount,
                isGlobalVisible = notice.isGlobalVisible,
                createdAt = notice.createdAt,
                updatedAt = notice.updatedAt,
                teamId = notice.teamId,
                teamName = team?.name ?: "Unknown Team",
                teamSubdomain = team?.code
            )
        }
    }
}