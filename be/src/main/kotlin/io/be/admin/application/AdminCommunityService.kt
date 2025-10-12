package io.be.admin.application

import io.be.admin.domain.AdminLevel
import io.be.community.domain.CommunityPost
import io.be.community.domain.CommunityPostRepository
import io.be.community.domain.CommunityComment
import io.be.community.domain.CommunityCommentRepository
import io.be.community.domain.CommunityCategory
import io.be.shared.exception.NotFoundException
import io.be.shared.exception.UnauthorizedAccessException
import org.slf4j.LoggerFactory
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

/**
 * 관리자 전용: 커뮤니티 관리 서비스
 */
@Service
@Transactional
class AdminCommunityService(
    private val communityPostRepository: CommunityPostRepository,
    private val communityCommentRepository: CommunityCommentRepository
) {
    
    private val logger = LoggerFactory.getLogger(AdminCommunityService::class.java)
    
    /**
     * 관리자 권한으로 게시글 목록 조회 (삭제된 것 포함)
     */
    @Transactional(readOnly = true)
    fun getPostsForAdmin(
        adminInfo: AdminInfo,
        teamId: Long?,
        includeInactive: Boolean = false,
        pageable: Pageable
    ): Page<AdminCommunityPostResponse> {
        
        // 권한 검증
        validateAdminAccess(adminInfo, teamId)
        
        val posts = when {
            // 마스터 관리자 - 모든 팀 조회 가능
            adminInfo.adminLevel == AdminLevel.MASTER && teamId == null -> {
                if (includeInactive) {
                    communityPostRepository.findAll(pageable)
                } else {
                    communityPostRepository.findByIsActiveTrueOrderByCreatedAtDesc(pageable)
                }
            }
            // 특정 팀 조회 (마스터 또는 해당 서브도메인 관리자)
            teamId != null -> {
                if (includeInactive) {
                    communityPostRepository.findByTeamIdOrderByCreatedAtDesc(teamId, pageable)
                } else {
                    communityPostRepository.findByTeamIdAndIsActiveTrueOrderByCreatedAtDesc(teamId, pageable)
                }
            }
            // 서브도메인 관리자 - 자신의 팀만
            else -> {
                val subdomainTeamId = getTeamIdFromSubdomain(adminInfo.teamSubdomain!!)
                if (includeInactive) {
                    communityPostRepository.findByTeamIdOrderByCreatedAtDesc(subdomainTeamId, pageable)
                } else {
                    communityPostRepository.findByTeamIdAndIsActiveTrueOrderByCreatedAtDesc(subdomainTeamId, pageable)
                }
            }
        }
        
        return posts.map { post ->
            val commentCount = communityCommentRepository.countByPostIdAndIsActiveTrue(post.id)
            AdminCommunityPostResponse.from(post, commentCount.toInt())
        }
    }
    
    /**
     * 게시글 상세 조회 (관리자용 - 삭제된 댓글도 조회)
     */
    @Transactional(readOnly = true)
    fun getPostDetailForAdmin(postId: Long, adminInfo: AdminInfo): AdminCommunityPostDetailResponse {
        
        val post = communityPostRepository.findById(postId).orElse(null)
            ?: throw NotFoundException("Post not found: $postId")
        
        // 권한 검증
        validateAdminAccess(adminInfo, post.teamId)
        
        // 모든 댓글 조회 (삭제된 것 포함)
        val allComments = communityCommentRepository.findByPostIdOrderByCreatedAtAsc(postId)
        val activeComments = allComments.filter { it.isActive }
        val inactiveComments = allComments.filter { !it.isActive }
        
        return AdminCommunityPostDetailResponse(
            post = AdminCommunityPostResponse.from(post, allComments.size),
            activeComments = activeComments.map { AdminCommunityCommentResponse.from(it) },
            inactiveComments = inactiveComments.map { AdminCommunityCommentResponse.from(it) }
        )
    }
    
    /**
     * 게시글 비활성화 (관리자용 삭제)
     */
    fun deactivatePost(postId: Long, adminInfo: AdminInfo, reason: String? = null) {
        
        val post = communityPostRepository.findById(postId).orElse(null)
            ?: throw NotFoundException("Post not found: $postId")
        
        // 권한 검증
        validateAdminAccess(adminInfo, post.teamId)
        
        val updatedPost = post.copy(
            isActive = false,
            updatedAt = LocalDateTime.now()
        )
        
        communityPostRepository.save(updatedPost)
        
        logger.info("Post deactivated by admin ${adminInfo.username}: postId=$postId, reason=$reason")
    }
    
    /**
     * 게시글 활성화 (복구)
     */
    fun activatePost(postId: Long, adminInfo: AdminInfo) {
        
        val post = communityPostRepository.findById(postId).orElse(null)
            ?: throw NotFoundException("Post not found: $postId")
        
        // 권한 검증
        validateAdminAccess(adminInfo, post.teamId)
        
        val updatedPost = post.copy(
            isActive = true,
            updatedAt = LocalDateTime.now()
        )
        
        communityPostRepository.save(updatedPost)
        
        logger.info("Post activated by admin ${adminInfo.username}: postId=$postId")
    }
    
    /**
     * 댓글 비활성화 (관리자용 삭제)
     */
    fun deactivateComment(commentId: Long, adminInfo: AdminInfo, reason: String? = null) {
        
        val comment = communityCommentRepository.findById(commentId).orElse(null)
            ?: throw NotFoundException("Comment not found: $commentId")
        
        val post = comment.post
        
        // 권한 검증
        validateAdminAccess(adminInfo, post.teamId)
        
        val updatedComment = comment.copy(
            isActive = false,
            updatedAt = LocalDateTime.now()
        )
        
        communityCommentRepository.save(updatedComment)
        
        logger.info("Comment deactivated by admin ${adminInfo.username}: commentId=$commentId, reason=$reason")
    }
    
    /**
     * 댓글 활성화 (복구)
     */
    fun activateComment(commentId: Long, adminInfo: AdminInfo) {
        
        val comment = communityCommentRepository.findById(commentId).orElse(null)
            ?: throw NotFoundException("Comment not found: $commentId")
        
        val post = comment.post
        
        // 권한 검증
        validateAdminAccess(adminInfo, post.teamId)
        
        val updatedComment = comment.copy(
            isActive = true,
            updatedAt = LocalDateTime.now()
        )
        
        communityCommentRepository.save(updatedComment)
        
        logger.info("Comment activated by admin ${adminInfo.username}: commentId=$commentId")
    }
    
    /**
     * 공지사항 게시글 생성 (관리자 전용)
     */
    fun createNoticePost(request: CreateNoticePostRequest, adminInfo: AdminInfo): AdminCommunityPostResponse {
        
        val teamId = request.teamId ?: getTeamIdFromSubdomain(adminInfo.teamSubdomain!!)
        
        // 권한 검증
        validateAdminAccess(adminInfo, teamId)
        
        val noticePost = CommunityPost(
            title = "[공지] ${request.title}",
            content = request.content,
            authorName = "관리자",
            authorEmail = adminInfo.email,
            authorPasswordHash = "ADMIN_POST", // 관리자 게시글 식별용
            teamId = teamId,
            teamSubdomain = adminInfo.teamSubdomain,
            category = CommunityCategory.ANNOUNCEMENT,
            isActive = true,
            createdAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now()
        )
        
        val savedPost = communityPostRepository.save(noticePost)
        
        logger.info("Notice post created by admin ${adminInfo.username}: postId=${savedPost.id}, title=${savedPost.title}")
        
        return AdminCommunityPostResponse.from(savedPost, 0)
    }
    
    /**
     * 관리자 접근 권한 검증
     */
    private fun validateAdminAccess(adminInfo: AdminInfo, teamId: Long?) {
        when (adminInfo.adminLevel) {
            AdminLevel.MASTER -> {
                // 마스터 관리자는 모든 팀 접근 가능
                return
            }
            AdminLevel.SUBDOMAIN -> {
                // 서브도메인 관리자는 자신의 팀만 접근 가능
                val subdomainTeamId = getTeamIdFromSubdomain(adminInfo.teamSubdomain!!)
                if (teamId != null && teamId != subdomainTeamId) {
                    throw UnauthorizedAccessException("Access denied to team $teamId")
                }
            }
        }
    }
    
    /**
     * 서브도메인에서 팀 ID 추출 (임시 구현)
     * TODO: 실제로는 TeamService나 별도 매핑 테이블 사용
     */
    private fun getTeamIdFromSubdomain(subdomain: String): Long {
        // 임시로 하드코딩된 매핑
        return when (subdomain) {
            "team1" -> 1L
            "team2" -> 2L
            "team3" -> 3L
            else -> throw NotFoundException("Team not found for subdomain: $subdomain")
        }
    }
}

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