package io.be.notice.dto

import io.be.notice.domain.Notice
import io.be.notice.domain.NoticeComment
import io.be.team.domain.Team
import java.time.LocalDateTime

// 공지사항 응답 DTO
data class NoticeResponse(
    val id: Long,
    val title: String,
    val content: String,
    val authorName: String,
    val viewCount: Int,
    val commentCount: Long,
    val isGlobalVisible: Boolean,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
) {
    companion object {
        fun from(notice: Notice, commentCount: Long): NoticeResponse {
            return NoticeResponse(
                id = notice.id,
                title = notice.title,
                content = notice.content,
                authorName = notice.authorName,
                viewCount = notice.viewCount,
                commentCount = commentCount,
                isGlobalVisible = notice.isGlobalVisible,
                createdAt = notice.createdAt,
                updatedAt = notice.updatedAt
            )
        }
    }
}

// 공지사항 상세 응답 DTO
data class NoticeDetailResponse(
    val id: Long,
    val title: String,
    val content: String,
    val authorName: String,
    val authorEmail: String?,
    val authorPhone: String?,
    val viewCount: Int,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
    val comments: List<NoticeCommentResponse>
) {
    companion object {
        fun from(notice: Notice, comments: List<NoticeCommentResponse>): NoticeDetailResponse {
            return NoticeDetailResponse(
                id = notice.id,
                title = notice.title,
                content = notice.content,
                authorName = notice.authorName,
                authorEmail = notice.authorEmail,
                authorPhone = notice.authorPhone,
                viewCount = notice.viewCount,
                createdAt = notice.createdAt,
                updatedAt = notice.updatedAt,
                comments = comments
            )
        }
    }
}

// 공지사항 댓글 응답 DTO
data class NoticeCommentResponse(
    val id: Long,
    val content: String,
    val authorName: String,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
) {
    companion object {
        fun from(comment: NoticeComment): NoticeCommentResponse {
            return NoticeCommentResponse(
                id = comment.id,
                content = comment.content,
                authorName = comment.authorName,
                createdAt = comment.createdAt,
                updatedAt = comment.updatedAt
            )
        }
    }
}

// 공지사항 권한 확인 응답 DTO
data class NoticeOwnershipCheckResponse(
    val isOwner: Boolean,
    val canEdit: Boolean,
    val canDelete: Boolean
)

// 공지사항 목록 응답 DTO
data class NoticesResponse(
    val content: List<NoticeResponse>,
    val totalElements: Long,
    val totalPages: Int,
    val size: Int,
    val number: Int,
    val first: Boolean,
    val last: Boolean
)