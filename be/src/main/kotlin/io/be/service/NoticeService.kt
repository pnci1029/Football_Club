package io.be.service

import io.be.entity.Notice
import io.be.entity.NoticeComment
import io.be.entity.Team
import io.be.repository.NoticeRepository
import io.be.repository.NoticeCommentRepository
import io.be.repository.TeamRepository
import io.be.exception.ResourceNotFoundException
import io.be.exception.InvalidRequestException
import io.be.dto.*
import org.slf4j.LoggerFactory
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.atomic.AtomicInteger

@Service
@Transactional
class NoticeService(
    private val noticeRepository: NoticeRepository,
    private val commentRepository: NoticeCommentRepository,
    private val teamRepository: TeamRepository,
    private val profanityFilterService: ProfanityFilterService
) {
    
    private val passwordEncoder = BCryptPasswordEncoder()
    private val logger = LoggerFactory.getLogger(NoticeService::class.java)
    
    // Rate limiting을 위한 간단한 메모리 기반 카운터
    private val ownershipCheckAttempts = ConcurrentHashMap<String, AtomicInteger>()
    private val lastAttemptTime = ConcurrentHashMap<String, Long>()
    private val MAX_ATTEMPTS_PER_HOUR = 10
    private val RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000L // 1시간

    /**
     * 공지사항 목록 조회 (페이징)
     */
    @Transactional(readOnly = true)
    fun getNotices(teamId: Long, page: Int, size: Int, keyword: String? = null): Page<NoticeResponse> {
        logger.info("Fetching notices for teamId: $teamId, page: $page, size: $size, keyword: $keyword")
        val pageable: Pageable = PageRequest.of(page, size)

        val notices = if (keyword.isNullOrBlank()) {
            noticeRepository.findByTeamIdAndIsActiveTrueOrderByCreatedAtDesc(teamId, pageable)
        } else {
            noticeRepository.findByTeamIdAndKeyword(teamId, keyword.trim(), pageable)
        }
        
        logger.info("Found ${notices.totalElements} notices for teamId: $teamId")

        return notices.map { notice ->
            val commentCount = commentRepository.countByNoticeIdAndIsActiveTrue(notice.id)
            NoticeResponse.from(notice, commentCount)
        }
    }

    /**
     * 전체 팀의 공지사항 목록 조회 (관리자용)
     */
    @Transactional(readOnly = true)
    fun getAllNotices(page: Int, size: Int, keyword: String? = null): Page<AllNoticeResponse> {
        logger.info("Fetching all notices - page: $page, size: $size, keyword: $keyword")
        val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        
        val notices = if (keyword.isNullOrBlank()) {
            noticeRepository.findByIsActiveTrueOrderByCreatedAtDesc(pageable)
        } else {
            noticeRepository.findByIsActiveTrueAndTitleContainingIgnoreCaseOrContentContainingIgnoreCase(
                keyword.trim(), keyword.trim(), pageable
            )
        }

        logger.info("Found ${notices.totalElements} notices across all teams")

        return notices.map { notice ->
            val team = teamRepository.findById(notice.teamId).orElse(null)
            val commentCount = commentRepository.countByNoticeIdAndIsActiveTrue(notice.id)
            
            AllNoticeResponse.from(notice, team, commentCount)
        }
    }

    /**
     * 전체 노출 설정된 공지사항 목록 조회 (메인 페이지용)
     */
    @Transactional(readOnly = true)
    fun getGlobalNotices(page: Int, size: Int, keyword: String? = null): Page<AllNoticeResponse> {
        logger.info("Fetching global notices - page: $page, size: $size, keyword: $keyword")
        val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        
        val notices = if (keyword.isNullOrBlank()) {
            noticeRepository.findByIsActiveTrueAndIsGlobalVisibleTrueOrderByCreatedAtDesc(pageable)
        } else {
            noticeRepository.findByIsActiveTrueAndIsGlobalVisibleTrueAndKeyword(keyword.trim(), pageable)
        }

        logger.info("Found ${notices.totalElements} global visible notices")

        return notices.map { notice ->
            val team = teamRepository.findById(notice.teamId).orElse(null)
            val commentCount = commentRepository.countByNoticeIdAndIsActiveTrue(notice.id)
            
            AllNoticeResponse.from(notice, team, commentCount)
        }
    }

    /**
     * 공지사항 상세 조회
     */
    @Transactional(readOnly = true)
    fun getNotice(teamId: Long, noticeId: Long): NoticeDetailResponse {
        val notice = noticeRepository.findByIdAndTeamIdAndIsActiveTrue(noticeId, teamId)
            ?: throw ResourceNotFoundException("공지사항을 찾을 수 없습니다.")

        // 댓글 목록 조회
        val comments = commentRepository.findByNoticeIdAndIsActiveTrueOrderByCreatedAtAsc(noticeId)
            .map { NoticeCommentResponse.from(it) }

        return NoticeDetailResponse.from(notice, comments)
    }

    /**
     * 공지사항 작성
     */
    fun createNotice(request: CreateNoticeRequest): NoticeResponse {
        validateNoticeRequest(request)
        
        // 비속어 필터링 검사
        val profanityValidation = profanityFilterService.validateContent(request.title, request.content)
        if (!profanityValidation.isValid) {
            val violationMessage = profanityValidation.violations.firstOrNull() ?: "부적절한 표현이 포함되어 있습니다."
            throw InvalidRequestException("content", "profanity", violationMessage)
        }

        val notice = Notice(
            title = request.title.trim(),
            content = request.content.trim(),
            authorName = request.authorName.trim(),
            authorEmail = request.authorEmail?.trim(),
            authorPhone = request.authorPhone?.trim(),
            authorPasswordHash = passwordEncoder.encode(request.authorPassword),
            teamId = request.teamId,
            teamSubdomain = "${request.teamId}",
            isGlobalVisible = request.isGlobalVisible
        )

        val savedNotice = noticeRepository.save(notice)
        logger.info("New notice created: ${savedNotice.id} for team: ${request.teamId}")

        return NoticeResponse.from(savedNotice, 0)
    }

    /**
     * 공지사항 수정
     */
    fun updateNotice(noticeId: Long, request: UpdateNoticeRequest): NoticeResponse {
        val notice = noticeRepository.findByIdAndTeamIdAndIsActiveTrue(noticeId, request.teamId)
            ?: throw ResourceNotFoundException("공지사항을 찾을 수 없습니다.")

        // 작성자 권한 체크 - 비밀번호 확인
        if (notice.authorPasswordHash.isNullOrBlank()) {
            logger.warn("Notice $noticeId has no password hash - cannot update")
            throw InvalidRequestException("permission", "password", "이 공지사항은 비밀번호가 설정되지 않아 수정할 수 없습니다.")
        }
        
        if (!passwordEncoder.matches(request.authorPassword, notice.authorPasswordHash)) {
            throw InvalidRequestException("permission", "password", "비밀번호가 올바르지 않습니다.")
        }

        validateUpdateRequest(request)
        
        // 비속어 필터링 검사
        val profanityValidation = profanityFilterService.validateContent(request.title, request.content)
        if (!profanityValidation.isValid) {
            val violationMessage = profanityValidation.violations.firstOrNull() ?: "부적절한 표현이 포함되어 있습니다."
            throw InvalidRequestException("content", "profanity", violationMessage)
        }

        val updatedNotice = notice.copy(
            title = request.title?.trim() ?: notice.title,
            content = request.content?.trim() ?: notice.content,
            isGlobalVisible = request.isGlobalVisible ?: notice.isGlobalVisible,
            updatedAt = LocalDateTime.now()
        )

        val savedNotice = noticeRepository.save(updatedNotice)
        val commentCount = commentRepository.countByNoticeIdAndIsActiveTrue(savedNotice.id)

        return NoticeResponse.from(savedNotice, commentCount)
    }

    /**
     * 공지사항 삭제 (비활성화)
     */
    fun deleteNotice(teamId: Long, noticeId: Long, authorPassword: String) {
        val notice = noticeRepository.findByIdAndTeamIdAndIsActiveTrue(noticeId, teamId)
            ?: throw ResourceNotFoundException("공지사항을 찾을 수 없습니다.")

        // 작성자 권한 체크 - 비밀번호 확인
        if (notice.authorPasswordHash.isNullOrBlank()) {
            logger.warn("Notice $noticeId has no password hash - cannot delete")
            throw InvalidRequestException("permission", "password", "이 공지사항은 비밀번호가 설정되지 않아 삭제할 수 없습니다.")
        }
        
        if (!passwordEncoder.matches(authorPassword, notice.authorPasswordHash)) {
            throw InvalidRequestException("permission", "password", "비밀번호가 올바르지 않습니다.")
        }

        val deactivatedNotice = notice.copy(
            isActive = false,
            updatedAt = LocalDateTime.now()
        )

        noticeRepository.save(deactivatedNotice)
        logger.info("Notice deactivated: $noticeId for team: $teamId")
    }

    /**
     * 댓글 작성
     */
    fun createComment(noticeId: Long, request: CreateNoticeCommentRequest): NoticeCommentResponse {
        val notice = noticeRepository.findByIdAndTeamIdAndIsActiveTrue(noticeId, request.teamId)
            ?: throw ResourceNotFoundException("공지사항을 찾을 수 없습니다.")

        validateCommentRequest(request)
        
        // 비속어 필터링 검사 (댓글 내용만)
        val profanityValidation = profanityFilterService.validateContent(null, request.content)
        if (!profanityValidation.isValid) {
            val violationMessage = profanityValidation.violations.firstOrNull() ?: "댓글에 부적절한 표현이 포함되어 있습니다."
            throw InvalidRequestException("content", "profanity", violationMessage)
        }

        val comment = NoticeComment(
            notice = notice,
            content = request.content.trim(),
            authorName = request.authorName.trim(),
            authorEmail = request.authorEmail?.trim(),
            authorPasswordHash = passwordEncoder.encode(request.authorPassword)
        )

        val savedComment = commentRepository.save(comment)
        logger.info("New comment created: ${savedComment.id} for notice: $noticeId")

        return NoticeCommentResponse.from(savedComment)
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

    private fun validateNoticeRequest(request: CreateNoticeRequest) {
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

    private fun validateUpdateRequest(request: UpdateNoticeRequest) {
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

    private fun validateCommentRequest(request: CreateNoticeCommentRequest) {
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
     * 공지사항 작성자 권한 확인 - 보안 강화
     */
    @Transactional(readOnly = true)
    fun checkNoticeOwnership(noticeId: Long, teamId: Long, authorPassword: String, clientIdentifier: String = "unknown"): Boolean {
        // Rate limiting 체크
        if (!checkRateLimit("${clientIdentifier}_notice_${noticeId}")) {
            throw InvalidRequestException("rate_limit", "attempts", "너무 많은 시도입니다. 잠시 후 다시 시도해주세요.")
        }
        if (authorPassword.isBlank()) {
            logger.warn("Empty password provided for notice ownership check - noticeId: $noticeId")
            return false
        }
        
        if (authorPassword.length > 100) {
            logger.warn("Password too long for notice ownership check - noticeId: $noticeId")
            return false
        }
        
        val notice = noticeRepository.findByIdAndTeamIdAndIsActiveTrue(noticeId, teamId)
            ?: run {
                logger.warn("Notice not found or inactive - noticeId: $noticeId, teamId: $teamId")
                return false
            }
        
        logger.debug("Checking notice ownership - noticeId: $noticeId, hasPasswordHash: ${!notice.authorPasswordHash.isNullOrBlank()}")
        
        if (notice.authorPasswordHash.isNullOrBlank()) {
            logger.warn("Notice $noticeId has no password hash - cannot verify ownership")
            return false
        }
        
        return try {
            passwordEncoder.matches(authorPassword, notice.authorPasswordHash)
        } catch (e: Exception) {
            logger.error("Password verification failed for noticeId: $noticeId", e)
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

    /**
     * 관리자용 공지사항 수정 (비밀번호 검증 없음)
     */
    fun adminUpdateNotice(noticeId: Long, teamId: Long, title: String?, content: String?, isGlobalVisible: Boolean? = null): NoticeResponse {
        val notice = noticeRepository.findByIdAndTeamIdAndIsActiveTrue(noticeId, teamId)
            ?: throw ResourceNotFoundException("공지사항을 찾을 수 없습니다.")

        // 제목, 내용 검증
        title?.let {
            if (it.isBlank() || it.length > 200) {
                throw InvalidRequestException("title", it, "제목이 올바르지 않습니다.")
            }
        }
        content?.let {
            if (it.isBlank() || it.length > 10000) {
                throw InvalidRequestException("content", it, "내용이 올바르지 않습니다.")
            }
        }
        
        // 비속어 필터링 검사
        val profanityValidation = profanityFilterService.validateContent(title, content)
        if (!profanityValidation.isValid) {
            val violationMessage = profanityValidation.violations.firstOrNull() ?: "부적절한 표현이 포함되어 있습니다."
            throw InvalidRequestException("content", "profanity", violationMessage)
        }

        val updatedNotice = notice.copy(
            title = title?.trim() ?: notice.title,
            content = content?.trim() ?: notice.content,
            isGlobalVisible = isGlobalVisible ?: notice.isGlobalVisible,
            updatedAt = LocalDateTime.now()
        )

        val savedNotice = noticeRepository.save(updatedNotice)
        val commentCount = commentRepository.countByNoticeIdAndIsActiveTrue(savedNotice.id)

        logger.info("Admin updated notice: $noticeId for team: $teamId")
        return NoticeResponse.from(savedNotice, commentCount)
    }

    /**
     * 관리자용 공지사항 삭제 (비밀번호 검증 없음)
     */
    fun adminDeleteNotice(teamId: Long, noticeId: Long) {
        val notice = noticeRepository.findByIdAndTeamIdAndIsActiveTrue(noticeId, teamId)
            ?: throw ResourceNotFoundException("공지사항을 찾을 수 없습니다.")

        val deactivatedNotice = notice.copy(
            isActive = false,
            updatedAt = LocalDateTime.now()
        )

        noticeRepository.save(deactivatedNotice)
        logger.info("Admin deleted notice: $noticeId for team: $teamId")
    }

    /**
     * 관리자용 댓글 삭제 (비밀번호 검증 없음)
     */
    fun adminDeleteComment(teamId: Long, commentId: Long) {
        val comment = commentRepository.findByIdAndTeamId(commentId, teamId)
            ?: throw ResourceNotFoundException("댓글을 찾을 수 없습니다.")

        val deactivatedComment = comment.copy(
            isActive = false,
            updatedAt = LocalDateTime.now()
        )

        commentRepository.save(deactivatedComment)
        logger.info("Admin deleted comment: $commentId for team: $teamId")
    }
}