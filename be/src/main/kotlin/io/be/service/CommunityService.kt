package io.be.service

import io.be.entity.CommunityPost
import io.be.entity.CommunityComment
import io.be.repository.CommunityPostRepository
import io.be.repository.CommunityCommentRepository
import io.be.exception.ResourceNotFoundException
import io.be.exception.InvalidRequestException
import org.slf4j.LoggerFactory
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
@Transactional
class CommunityService(
    private val postRepository: CommunityPostRepository,
    private val commentRepository: CommunityCommentRepository
) {
    
    private val logger = LoggerFactory.getLogger(CommunityService::class.java)
    
    /**
     * 게시글 목록 조회 (페이징)
     */
    @Transactional(readOnly = true)
    fun getPosts(teamId: Long, page: Int, size: Int, keyword: String? = null): Page<CommunityPostResponse> {
        val pageable: Pageable = PageRequest.of(page, size)
        
        val posts = if (keyword.isNullOrBlank()) {
            postRepository.findByTeamIdAndIsActiveTrueOrderByIsNoticeDescCreatedAtDesc(teamId, pageable)
        } else {
            postRepository.findByTeamIdAndKeyword(teamId, keyword.trim(), pageable)
        }
        
        return posts.map { post ->
            val commentCount = commentRepository.countByPostIdAndIsActiveTrue(post.id)
            CommunityPostResponse.from(post, commentCount)
        }
    }
    
    /**
     * 게시글 상세 조회
     */
    @Transactional
    fun getPost(teamId: Long, postId: Long, incrementView: Boolean = true): CommunityPostDetailResponse {
        val post = postRepository.findByIdAndTeamIdAndIsActiveTrue(postId, teamId)
            ?: throw ResourceNotFoundException("게시글을 찾을 수 없습니다.")
        
        // 조회수 증가
        if (incrementView) {
            postRepository.incrementViewCount(postId)
        }
        
        // 댓글 목록 조회
        val comments = commentRepository.findByPostIdAndIsActiveTrueOrderByCreatedAtAsc(postId)
            .map { CommunityCommentResponse.from(it) }
        
        return CommunityPostDetailResponse.from(post, comments)
    }
    
    /**
     * 게시글 작성
     */
    fun createPost(request: CreateCommunityPostRequest): CommunityPostResponse {
        validatePostRequest(request)
        
        val post = CommunityPost(
            title = request.title.trim(),
            content = request.content.trim(),
            authorName = request.authorName.trim(),
            authorEmail = request.authorEmail?.trim(),
            authorPhone = request.authorPhone?.trim(),
            teamId = request.teamId,
            isNotice = false // 일반 사용자는 공지사항 작성 불가
        )
        
        val savedPost = postRepository.save(post)
        logger.info("New community post created: ${savedPost.id} for team: ${request.teamId}")
        
        return CommunityPostResponse.from(savedPost, 0)
    }
    
    /**
     * 게시글 수정
     */
    fun updatePost(postId: Long, request: UpdateCommunityPostRequest): CommunityPostResponse {
        val post = postRepository.findByIdAndTeamIdAndIsActiveTrue(postId, request.teamId)
            ?: throw ResourceNotFoundException("게시글을 찾을 수 없습니다.")
        
        validateUpdateRequest(request)
        
        val updatedPost = post.copy(
            title = request.title?.trim() ?: post.title,
            content = request.content?.trim() ?: post.content,
            updatedAt = LocalDateTime.now()
        )
        
        val savedPost = postRepository.save(updatedPost)
        val commentCount = commentRepository.countByPostIdAndIsActiveTrue(savedPost.id)
        
        return CommunityPostResponse.from(savedPost, commentCount)
    }
    
    /**
     * 게시글 삭제 (비활성화)
     */
    fun deletePost(teamId: Long, postId: Long) {
        val post = postRepository.findByIdAndTeamIdAndIsActiveTrue(postId, teamId)
            ?: throw ResourceNotFoundException("게시글을 찾을 수 없습니다.")
        
        val deactivatedPost = post.copy(
            isActive = false,
            updatedAt = LocalDateTime.now()
        )
        
        postRepository.save(deactivatedPost)
        logger.info("Community post deactivated: $postId for team: $teamId")
    }
    
    /**
     * 댓글 작성
     */
    fun createComment(postId: Long, request: CreateCommunityCommentRequest): CommunityCommentResponse {
        val post = postRepository.findByIdAndTeamIdAndIsActiveTrue(postId, request.teamId)
            ?: throw ResourceNotFoundException("게시글을 찾을 수 없습니다.")
        
        validateCommentRequest(request)
        
        val comment = CommunityComment(
            post = post,
            content = request.content.trim(),
            authorName = request.authorName.trim(),
            authorEmail = request.authorEmail?.trim()
        )
        
        val savedComment = commentRepository.save(comment)
        logger.info("New comment created: ${savedComment.id} for post: $postId")
        
        return CommunityCommentResponse.from(savedComment)
    }
    
    /**
     * 댓글 삭제 (비활성화)
     */
    fun deleteComment(teamId: Long, commentId: Long) {
        val comment = commentRepository.findByIdAndTeamId(commentId, teamId)
            ?: throw ResourceNotFoundException("댓글을 찾을 수 없습니다.")
        
        val deactivatedComment = comment.copy(
            isActive = false,
            updatedAt = LocalDateTime.now()
        )
        
        commentRepository.save(deactivatedComment)
        logger.info("Comment deactivated: $commentId for team: $teamId")
    }
    
    private fun validatePostRequest(request: CreateCommunityPostRequest) {
        if (request.title.isBlank()) {
            throw InvalidRequestException("title", request.title, "제목을 입력해주세요.")
        }
        if (request.title.length > 200) {
            throw InvalidRequestException("title", request.title, "제목은 200자를 초과할 수 없습니다.")
        }
        if (request.content.isBlank()) {
            throw InvalidRequestException("content", request.content, "내용을 입력해주세요.")
        }
        if (request.content.length > 10000) {
            throw InvalidRequestException("content", request.content, "내용은 10000자를 초과할 수 없습니다.")
        }
        if (request.authorName.isBlank()) {
            throw InvalidRequestException("authorName", request.authorName, "작성자명을 입력해주세요.")
        }
        if (request.authorName.length > 50) {
            throw InvalidRequestException("authorName", request.authorName, "작성자명은 50자를 초과할 수 없습니다.")
        }
    }
    
    private fun validateUpdateRequest(request: UpdateCommunityPostRequest) {
        request.title?.let { 
            if (it.isBlank() || it.length > 200) {
                throw InvalidRequestException("title", it, "제목이 올바르지 않습니다.")
            }
        }
        request.content?.let {
            if (it.isBlank() || it.length > 10000) {
                throw InvalidRequestException("content", it, "내용이 올바르지 않습니다.")
            }
        }
    }
    
    private fun validateCommentRequest(request: CreateCommunityCommentRequest) {
        if (request.content.isBlank()) {
            throw InvalidRequestException("content", request.content, "댓글 내용을 입력해주세요.")
        }
        if (request.content.length > 1000) {
            throw InvalidRequestException("content", request.content, "댓글은 1000자를 초과할 수 없습니다.")
        }
        if (request.authorName.isBlank()) {
            throw InvalidRequestException("authorName", request.authorName, "작성자명을 입력해주세요.")
        }
        if (request.authorName.length > 50) {
            throw InvalidRequestException("authorName", request.authorName, "작성자명은 50자를 초과할 수 없습니다.")
        }
    }
}

// DTO 클래스들
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

data class CreateCommunityPostRequest(
    val title: String,
    val content: String,
    val authorName: String,
    val authorEmail: String? = null,
    val authorPhone: String? = null,
    val teamId: Long
)

data class UpdateCommunityPostRequest(
    val title: String? = null,
    val content: String? = null,
    val teamId: Long
)

data class CreateCommunityCommentRequest(
    val content: String,
    val authorName: String,
    val authorEmail: String? = null,
    val teamId: Long
)