package io.be.admin.dto

import io.be.community.domain.CommunityPost
import io.be.community.domain.CommunityComment
import io.be.community.domain.CommunityCategory
import java.time.LocalDateTime

/**
 * 관리자 액션 요청 DTO
 */
data class AdminActionRequest(
    val reason: String? = null
)

/**
 * 커뮤니티 통계 응답 DTO (임시)
 */
data class CommunityStatsResponse(
    val message: String,
    val adminLevel: String,
    val accessibleTeam: String
)

/**
 * 관리자용 커뮤니티 게시글 응답 DTO
 */
data class AdminCommunityPostResponse(
    val id: Long,
    val title: String,
    val content: String,
    val authorName: String,
    val authorEmail: String?,
    val teamId: Long,
    val teamSubdomain: String?,
    val category: CommunityCategory,
    val viewCount: Int,
    val commentCount: Int,
    val isActive: Boolean,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
) {
    companion object {
        fun from(post: CommunityPost, commentCount: Int): AdminCommunityPostResponse {
            return AdminCommunityPostResponse(
                id = post.id,
                title = post.title,
                content = post.content,
                authorName = post.authorName,
                authorEmail = post.authorEmail,
                teamId = post.teamId,
                teamSubdomain = post.teamSubdomain,
                category = post.category,
                viewCount = post.viewCount,
                commentCount = commentCount,
                isActive = post.isActive,
                createdAt = post.createdAt,
                updatedAt = post.updatedAt
            )
        }
    }
}

/**
 * 관리자용 커뮤니티 댓글 응답 DTO
 */
data class AdminCommunityCommentResponse(
    val id: Long,
    val content: String,
    val authorName: String,
    val authorEmail: String?,
    val isActive: Boolean,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
) {
    companion object {
        fun from(comment: CommunityComment): AdminCommunityCommentResponse {
            return AdminCommunityCommentResponse(
                id = comment.id,
                content = comment.content,
                authorName = comment.authorName,
                authorEmail = comment.authorEmail,
                isActive = comment.isActive,
                createdAt = comment.createdAt,
                updatedAt = comment.updatedAt
            )
        }
    }
}

/**
 * 관리자용 게시글 상세 응답 DTO
 */
data class AdminCommunityPostDetailResponse(
    val post: AdminCommunityPostResponse,
    val activeComments: List<AdminCommunityCommentResponse>,
    val inactiveComments: List<AdminCommunityCommentResponse>
)

/**
 * 공지사항 게시글 생성 요청 DTO
 */
data class CreateNoticePostRequest(
    val title: String,
    val content: String,
    val teamId: Long? = null // null이면 관리자의 서브도메인 팀으로 설정
)