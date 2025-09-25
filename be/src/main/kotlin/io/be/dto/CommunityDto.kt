package io.be.dto

import io.be.entity.CommunityPost
import io.be.entity.CommunityComment
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.time.LocalDateTime

/**
 * 커뮤니티 관련 DTO 클래스들
 */

// Request DTOs
data class CreatePostRequest(
    @field:NotBlank(message = "제목을 입력해주세요.")
    @field:Size(max = 200, message = "제목은 200자를 초과할 수 없습니다.")
    val title: String,

    @field:NotBlank(message = "내용을 입력해주세요.")
    @field:Size(max = 10000, message = "내용은 10000자를 초과할 수 없습니다.")
    val content: String,

    @field:NotBlank(message = "작성자명을 입력해주세요.")
    @field:Size(max = 50, message = "작성자명은 50자를 초과할 수 없습니다.")
    val authorName: String,

    @field:Size(max = 100, message = "이메일은 100자를 초과할 수 없습니다.")
    val authorEmail: String? = null,

    @field:Size(max = 20, message = "전화번호는 20자를 초과할 수 없습니다.")
    val authorPhone: String? = null,
    
    @field:NotBlank(message = "비밀번호를 입력해주세요.")
    val authorPassword: String,

    val teamId: Long
)

data class UpdatePostRequest(
    @field:Size(max = 200, message = "제목은 200자를 초과할 수 없습니다.")
    val title: String? = null,

    @field:Size(max = 10000, message = "내용은 10000자를 초과할 수 없습니다.")
    val content: String? = null,

    @field:NotBlank(message = "비밀번호를 입력해주세요.")
    val authorPassword: String,

    val teamId: Long
)

data class CreateCommentRequest(
    @field:NotBlank(message = "댓글 내용을 입력해주세요.")
    @field:Size(max = 1000, message = "댓글은 1000자를 초과할 수 없습니다.")
    val content: String,

    @field:NotBlank(message = "작성자명을 입력해주세요.")
    @field:Size(max = 50, message = "작성자명은 50자를 초과할 수 없습니다.")
    val authorName: String,

    @field:Size(max = 100, message = "이메일은 100자를 초과할 수 없습니다.")
    val authorEmail: String? = null,
    
    @field:NotBlank(message = "비밀번호를 입력해주세요.")
    val authorPassword: String,

    val teamId: Long
)

data class OwnershipCheckRequest(
    @field:NotBlank(message = "비밀번호를 입력해주세요.")
    val authorPassword: String,
    
    val teamId: Long
)

// Response DTOs
data class CommunityPostResponse(
    val id: Long,
    val title: String,
    val content: String,
    val authorName: String,
    val viewCount: Int,
    val commentCount: Long,
    val isNotice: Boolean,
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
                isNotice = post.isNotice,
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
    val isNotice: Boolean,
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
                isNotice = post.isNotice,
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

// Service Request DTOs
data class CreateCommunityPostRequest(
    val title: String,
    val content: String,
    val authorName: String,
    val authorEmail: String? = null,
    val authorPhone: String? = null,
    val authorPassword: String,
    val teamId: Long
)

data class UpdateCommunityPostRequest(
    val title: String? = null,
    val content: String? = null,
    val authorPassword: String,
    val teamId: Long
)

data class CreateCommunityCommentRequest(
    val content: String,
    val authorName: String,
    val authorEmail: String? = null,
    val authorPassword: String,
    val teamId: Long
)