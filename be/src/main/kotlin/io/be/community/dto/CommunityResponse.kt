package io.be.community.dto

import io.be.community.domain.CommunityPost
import io.be.community.domain.CommunityComment
import io.be.team.domain.Team
import java.time.LocalDateTime

// Response DTOs
data class CommunityPostResponse(
    val id: Long,
    val title: String,
    val content: String,
    val authorName: String,
    val viewCount: Int,
    val commentCount: Long,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
) {
    companion object {
        fun from(post: CommunityPost, commentCount: Long): CommunityPostResponse {
            return CommunityPostResponse(
                id = post.id,
                title = post.title,
                content = post.content,
                authorName = post.authorName,
                viewCount = post.viewCount,
                commentCount = commentCount,
                createdAt = post.createdAt,
                updatedAt = post.updatedAt
            )
        }
    }
}

data class CommunityPostDetailResponse(
    val id: Long,
    val title: String,
    val content: String,
    val authorName: String,
    val authorEmail: String?,
    val authorPhone: String?,
    val viewCount: Int,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
    val comments: List<CommunityCommentResponse>
) {
    companion object {
        fun from(post: CommunityPost, comments: List<CommunityCommentResponse>): CommunityPostDetailResponse {
            return CommunityPostDetailResponse(
                id = post.id,
                title = post.title,
                content = post.content,
                authorName = post.authorName,
                authorEmail = post.authorEmail,
                authorPhone = post.authorPhone,
                viewCount = post.viewCount,
                createdAt = post.createdAt,
                updatedAt = post.updatedAt,
                comments = comments
            )
        }
    }
}

data class CommunityCommentResponse(
    val id: Long,
    val content: String,
    val authorName: String,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
) {
    companion object {
        fun from(comment: CommunityComment): CommunityCommentResponse {
            return CommunityCommentResponse(
                id = comment.id,
                content = comment.content,
                authorName = comment.authorName,
                createdAt = comment.createdAt,
                updatedAt = comment.updatedAt
            )
        }
    }
}

data class OwnershipCheckResponse(
    val isOwner: Boolean,
    val canEdit: Boolean,
    val canDelete: Boolean
)

// All Community DTOs
data class AllCommunityPostResponse(
    val id: Long,
    val title: String,
    val content: String,
    val authorName: String,
    val viewCount: Int,
    val commentCount: Long,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
    val teamId: Long,
    val teamName: String,
    val teamSubdomain: String?
) {
    companion object {
        fun from(post: CommunityPost, team: Team?, commentCount: Long): AllCommunityPostResponse {
            return AllCommunityPostResponse(
                id = post.id,
                title = post.title,
                content = post.content,
                authorName = post.authorName,
                viewCount = post.viewCount,
                commentCount = commentCount,
                createdAt = post.createdAt,
                updatedAt = post.updatedAt,
                teamId = post.teamId,
                teamName = team?.name ?: "Unknown Team",
                teamSubdomain = team?.code
            )
        }
    }
}

data class TeamInfoResponse(
    val id: Long,
    val name: String,
    val subdomain: String?,
    val description: String?
) {
    companion object {
        fun from(team: Team): TeamInfoResponse {
            return TeamInfoResponse(
                id = team.id,
                name = team.name,
                subdomain = team.code,
                description = team.description
            )
        }
    }
}