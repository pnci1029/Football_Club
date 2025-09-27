package io.be.service

import io.be.entity.CommunityPost
import io.be.entity.CommunityComment
import io.be.repository.CommunityPostRepository
import io.be.repository.CommunityCommentRepository
import io.be.exception.ResourceNotFoundException
import io.be.exception.InvalidRequestException
import io.be.dto.*
import org.slf4j.LoggerFactory
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.atomic.AtomicInteger

@Service
@Transactional
class CommunityService(
    private val postRepository: CommunityPostRepository,
    private val commentRepository: CommunityCommentRepository,
    private val profanityFilterService: ProfanityFilterService
) {
    
    private val passwordEncoder = BCryptPasswordEncoder()
    private val logger = LoggerFactory.getLogger(CommunityService::class.java)
    
    // Rate limiting을 위한 간단한 메모리 기반 카운터
    private val ownershipCheckAttempts = ConcurrentHashMap<String, AtomicInteger>()
    private val lastAttemptTime = ConcurrentHashMap<String, Long>()
    private val MAX_ATTEMPTS_PER_HOUR = 10
    private val RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000L // 1시간

    /**
     * 게시글 목록 조회 (페이징)
     */
    @Transactional(readOnly = true)
    fun getPosts(teamId: Long, page: Int, size: Int, keyword: String? = null): Page<CommunityPostResponse> {
        logger.info("Fetching posts for teamId: $teamId, page: $page, size: $size, keyword: $keyword")
        val pageable: Pageable = PageRequest.of(page, size)

        val posts = if (keyword.isNullOrBlank()) {
            postRepository.findByTeamIdAndIsActiveTrueOrderByIsNoticeDescCreatedAtDesc(teamId, pageable)
        } else {
            postRepository.findByTeamIdAndKeyword(teamId, keyword.trim(), pageable)
        }
        
        logger.info("Found ${posts.totalElements} posts for teamId: $teamId")

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
        
        // 비속어 필터링 검사
        val profanityValidation = profanityFilterService.validateContent(request.title, request.content)
        if (!profanityValidation.isValid) {
            throw InvalidRequestException("profanity", "content", profanityValidation.violations.first())
        }

        val post = CommunityPost(
            title = request.title.trim(),
            content = request.content.trim(),
            authorName = request.authorName.trim(),
            authorEmail = request.authorEmail?.trim(),
            authorPhone = request.authorPhone?.trim(),
            authorPasswordHash = passwordEncoder.encode(request.authorPassword),
            teamId = request.teamId,
            teamSubdomain = "${request.teamId}", // 임시로 팀ID 기반 서브도메인 생성
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

        // 작성자 권한 체크 - 비밀번호 확인
        if (post.authorPasswordHash.isNullOrBlank()) {
            logger.warn("Post $postId has no password hash - cannot update")
            throw InvalidRequestException("permission", "password", "이 게시글은 비밀번호가 설정되지 않아 수정할 수 없습니다.")
        }
        
        if (!passwordEncoder.matches(request.authorPassword, post.authorPasswordHash)) {
            throw InvalidRequestException("permission", "password", "비밀번호가 올바르지 않습니다.")
        }

        validateUpdateRequest(request)
        
        // 비속어 필터링 검사
        val profanityValidation = profanityFilterService.validateContent(request.title, request.content)
        if (!profanityValidation.isValid) {
            throw InvalidRequestException("profanity", "content", profanityValidation.violations.first())
        }

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
    fun deletePost(teamId: Long, postId: Long, authorPassword: String) {
        val post = postRepository.findByIdAndTeamIdAndIsActiveTrue(postId, teamId)
            ?: throw ResourceNotFoundException("게시글을 찾을 수 없습니다.")

        // 작성자 권한 체크 - 비밀번호 확인
        if (post.authorPasswordHash.isNullOrBlank()) {
            logger.warn("Post $postId has no password hash - cannot delete")
            throw InvalidRequestException("permission", "password", "이 게시글은 비밀번호가 설정되지 않아 삭제할 수 없습니다.")
        }
        
        if (!passwordEncoder.matches(authorPassword, post.authorPasswordHash)) {
            throw InvalidRequestException("permission", "password", "비밀번호가 올바르지 않습니다.")
        }

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
        
        // 비속어 필터링 검사 (댓글 내용만)
        val profanityValidation = profanityFilterService.validateContent(null, request.content)
        if (!profanityValidation.isValid) {
            throw InvalidRequestException("profanity", "content", profanityValidation.violations.first())
        }

        val comment = CommunityComment(
            post = post,
            content = request.content.trim(),
            authorName = request.authorName.trim(),
            authorEmail = request.authorEmail?.trim(),
            authorPasswordHash = passwordEncoder.encode(request.authorPassword)
        )

        val savedComment = commentRepository.save(comment)
        logger.info("New comment created: ${savedComment.id} for post: $postId")

        return CommunityCommentResponse.from(savedComment)
    }

    /**
     * 댓글 삭제 (비활성화)
     */
    fun deleteComment(teamId: Long, commentId: Long, authorPassword: String) {
        val comment = commentRepository.findByIdAndTeamId(commentId, teamId)
            ?: throw ResourceNotFoundException("댓글을 찾을 수 없습니다.")

        // 작성자 권한 체크 - 비밀번호 확인
        if (comment.authorPasswordHash.isNullOrBlank()) {
            logger.warn("Comment $commentId has no password hash - cannot delete")
            throw InvalidRequestException("permission", "password", "이 댓글은 비밀번호가 설정되지 않아 삭제할 수 없습니다.")
        }
        
        if (!passwordEncoder.matches(authorPassword, comment.authorPasswordHash)) {
            throw InvalidRequestException("permission", "password", "비밀번호가 올바르지 않습니다.")
        }

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

    /**
     * Rate limiting 체크
     */
    private fun checkRateLimit(identifier: String): Boolean {
        val now = System.currentTimeMillis()
        val key = "ownership_$identifier"
        
        // 시간 윈도우가 지났으면 카운터 리셋
        val lastTime = lastAttemptTime[key] ?: 0
        if (now - lastTime > RATE_LIMIT_WINDOW_MS) {
            ownershipCheckAttempts[key] = AtomicInteger(0)
            lastAttemptTime[key] = now
        }
        
        val attempts = ownershipCheckAttempts.computeIfAbsent(key) { AtomicInteger(0) }
        val currentAttempts = attempts.incrementAndGet()
        
        if (currentAttempts > MAX_ATTEMPTS_PER_HOUR) {
            logger.warn("Rate limit exceeded for identifier: $identifier, attempts: $currentAttempts")
            return false
        }
        
        lastAttemptTime[key] = now
        return true
    }

    /**
     * 게시글 작성자 권한 확인 - 보안 강화
     */
    @Transactional(readOnly = true)
    fun checkPostOwnership(postId: Long, teamId: Long, authorPassword: String, clientIdentifier: String = "unknown"): Boolean {
        // Rate limiting 체크
        if (!checkRateLimit("${clientIdentifier}_post_${postId}")) {
            throw InvalidRequestException("rate_limit", "attempts", "너무 많은 시도입니다. 잠시 후 다시 시도해주세요.")
        }
        if (authorPassword.isBlank()) {
            logger.warn("Empty password provided for post ownership check - postId: $postId")
            return false
        }
        
        if (authorPassword.length > 100) {
            logger.warn("Password too long for post ownership check - postId: $postId")
            return false
        }
        
        val post = postRepository.findByIdAndTeamIdAndIsActiveTrue(postId, teamId)
            ?: run {
                logger.warn("Post not found or inactive - postId: $postId, teamId: $teamId")
                return false
            }
        
        logger.debug("Checking post ownership - postId: $postId, hasPasswordHash: ${!post.authorPasswordHash.isNullOrBlank()}")
        
        if (post.authorPasswordHash.isNullOrBlank()) {
            logger.warn("Post $postId has no password hash - cannot verify ownership")
            return false
        }
        
        return try {
            passwordEncoder.matches(authorPassword, post.authorPasswordHash)
        } catch (e: Exception) {
            logger.error("Password verification failed for postId: $postId", e)
            false
        }
    }

    /**
     * 댓글 작성자 권한 확인 - 보안 강화
     */
    @Transactional(readOnly = true)
    fun checkCommentOwnership(commentId: Long, teamId: Long, authorPassword: String, clientIdentifier: String = "unknown"): Boolean {
        // Rate limiting 체크
        if (!checkRateLimit("${clientIdentifier}_comment_${commentId}")) {
            throw InvalidRequestException("rate_limit", "attempts", "너무 많은 시도입니다. 잠시 후 다시 시도해주세요.")
        }
        if (authorPassword.isBlank()) {
            logger.warn("Empty password provided for comment ownership check - commentId: $commentId")
            return false
        }
        
        if (authorPassword.length > 100) {
            logger.warn("Password too long for comment ownership check - commentId: $commentId")
            return false
        }
        
        val comment = commentRepository.findByIdAndTeamId(commentId, teamId)
            ?: run {
                logger.warn("Comment not found - commentId: $commentId, teamId: $teamId")
                return false
            }
        
        if (!comment.isActive) {
            logger.warn("Comment is inactive - commentId: $commentId")
            return false
        }
        
        logger.debug("Checking comment ownership - commentId: $commentId, hasPasswordHash: ${!comment.authorPasswordHash.isNullOrBlank()}")
        
        if (comment.authorPasswordHash.isNullOrBlank()) {
            logger.warn("Comment $commentId has no password hash - cannot verify ownership")
            return false
        }
        
        return try {
            passwordEncoder.matches(authorPassword, comment.authorPasswordHash)
        } catch (e: Exception) {
            logger.error("Password verification failed for commentId: $commentId", e)
            false
        }
    }
}

