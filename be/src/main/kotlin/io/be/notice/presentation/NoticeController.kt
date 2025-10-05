package io.be.notice.presentation

import io.be.notice.application.NoticeService
import io.be.shared.service.ViewCountService
import io.be.notice.dto.*
import io.be.shared.dto.ViewCount
import io.be.shared.util.ApiResponse
import io.be.shared.enums.ContentType
import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.Valid
import org.slf4j.LoggerFactory
import org.springframework.data.domain.Page
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v1/notices")
@CrossOrigin(origins = ["*"])
class NoticeController(
    private val noticeService: NoticeService,
    private val viewCountService: ViewCountService
) {

    private val logger = LoggerFactory.getLogger(NoticeController::class.java)

    /**
     * 테스트용 엔드포인트
     */
    @GetMapping("/test")
    fun test(): ResponseEntity<ApiResponse<String>> {
        return ResponseEntity.ok(ApiResponse.success("Notice API is working!"))
    }

    /**
     * 공지사항 목록 조회
     */
    @GetMapping
    fun getNotices(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(required = false) keyword: String?,
        @RequestParam teamId: Long
    ): ResponseEntity<ApiResponse<Page<NoticeResponse>>> {
        logger.info("GET /notices request - teamId: $teamId, page: $page, size: $size, keyword: $keyword")
        val notices = noticeService.getNotices(teamId, page, size, keyword)
        logger.info("Returning ${notices.content.size} notices out of ${notices.totalElements} total")
        return ResponseEntity.ok(ApiResponse.success(notices))
    }

    /**
     * 공지사항 상세 조회
     */
    @GetMapping("/{noticeId}")
    fun getNotice(
        @PathVariable noticeId: Long,
        @RequestParam teamId: Long,
        httpRequest: HttpServletRequest
    ): ResponseEntity<ApiResponse<NoticeDetailResponse>> {
        val notice = noticeService.getNotice(teamId, noticeId)
        
        // 조회수 자동 증가 처리
        val clientIp = getClientIpAddress(httpRequest)
        val userAgent = httpRequest.getHeader("User-Agent") ?: ""
        viewCountService.increaseViewCount(ContentType.NOTICE, noticeId, clientIp, userAgent)
        
        return ResponseEntity.ok(ApiResponse.success(notice))
    }


    /**
     * 공지사항 작성
     */
    @PostMapping
    fun createNotice(
        @Valid @RequestBody request: CreateNoticeRequestDto
    ): ResponseEntity<ApiResponse<NoticeResponse>> {
        val serviceRequest = CreateNoticeRequest(
            title = request.title,
            content = request.content,
            authorName = request.authorName,
            authorEmail = request.authorEmail,
            authorPhone = request.authorPhone,
            authorPassword = request.authorPassword,
            teamId = request.teamId
        )
        val notice = noticeService.createNotice(serviceRequest)
        return ResponseEntity.ok(ApiResponse.success(notice))
    }

    /**
     * 공지사항 수정
     */
    @PutMapping("/{noticeId}")
    fun updateNotice(
        @PathVariable noticeId: Long,
        @Valid @RequestBody request: UpdateNoticeRequestDto
    ): ResponseEntity<ApiResponse<NoticeResponse>> {
        val serviceRequest = UpdateNoticeRequest(
            title = request.title,
            content = request.content,
            authorPassword = request.authorPassword,
            teamId = request.teamId
        )
        val notice = noticeService.updateNotice(noticeId, serviceRequest)
        return ResponseEntity.ok(ApiResponse.success(notice))
    }

    /**
     * 공지사항 삭제
     */
    @DeleteMapping("/{noticeId}")
    fun deleteNotice(
        @PathVariable noticeId: Long,
        @RequestParam teamId: Long,
        @RequestParam authorPassword: String
    ): ResponseEntity<ApiResponse<String>> {
        noticeService.deleteNotice(teamId, noticeId, authorPassword)
        return ResponseEntity.ok(ApiResponse.success("공지사항이 삭제되었습니다."))
    }

    /**
     * 댓글 작성
     */
    @PostMapping("/{noticeId}/comments")
    fun createComment(
        @PathVariable noticeId: Long,
        @Valid @RequestBody request: CreateNoticeCommentRequestDto
    ): ResponseEntity<ApiResponse<NoticeCommentResponse>> {
        val serviceRequest = CreateNoticeCommentRequest(
            content = request.content,
            authorName = request.authorName,
            authorEmail = request.authorEmail,
            authorPassword = request.authorPassword,
            teamId = request.teamId
        )
        val comment = noticeService.createComment(noticeId, serviceRequest)
        return ResponseEntity.ok(ApiResponse.success(comment))
    }

    /**
     * 댓글 삭제
     */
    @DeleteMapping("/comments/{commentId}")
    fun deleteComment(
        @PathVariable commentId: Long,
        @RequestParam teamId: Long,
        @RequestParam authorPassword: String
    ): ResponseEntity<ApiResponse<String>> {
        noticeService.deleteComment(teamId, commentId, authorPassword)
        return ResponseEntity.ok(ApiResponse.success("댓글이 삭제되었습니다."))
    }

    /**
     * 공지사항 작성자 권한 확인 - 보안 강화
     */
    @PostMapping("/{noticeId}/ownership")
    fun checkNoticeOwnership(
        @PathVariable noticeId: Long,
        @RequestBody ownershipRequest: NoticeOwnershipCheckRequest,
        httpRequest: HttpServletRequest
    ): ResponseEntity<ApiResponse<NoticeOwnershipCheckResponse>> {
        val clientIp = getClientIpAddress(httpRequest)
        logger.info("Notice ownership check attempt - noticeId: $noticeId, teamId: ${ownershipRequest.teamId}, clientIp: $clientIp")

        val isOwner = noticeService.checkNoticeOwnership(noticeId, ownershipRequest.teamId, ownershipRequest.authorPassword, clientIp)

        return ResponseEntity.ok(ApiResponse.success(NoticeOwnershipCheckResponse(
            isOwner = isOwner,
            canEdit = isOwner,
            canDelete = isOwner
        )))
    }

    /**
     * 댓글 작성자 권한 확인 - 보안 강화
     */
    @PostMapping("/comments/{commentId}/ownership")
    fun checkCommentOwnership(
        @PathVariable commentId: Long,
        @RequestBody ownershipRequest: NoticeOwnershipCheckRequest,
        httpRequest: HttpServletRequest
    ): ResponseEntity<ApiResponse<NoticeOwnershipCheckResponse>> {
        val clientIp = getClientIpAddress(httpRequest)
        logger.info("Comment ownership check attempt - commentId: $commentId, teamId: ${ownershipRequest.teamId}, clientIp: $clientIp")

        val isOwner = noticeService.checkCommentOwnership(commentId, ownershipRequest.teamId, ownershipRequest.authorPassword, clientIp)

        return ResponseEntity.ok(ApiResponse.success(NoticeOwnershipCheckResponse(
            isOwner = isOwner,
            canEdit = false, // 댓글은 수정 불가
            canDelete = isOwner
        )))
    }

    private fun getClientIpAddress(request: HttpServletRequest): String {
        val xForwardedFor = request.getHeader("X-Forwarded-For")
        val xRealIp = request.getHeader("X-Real-IP")
        val xOriginalForwardedFor = request.getHeader("X-Original-Forwarded-For")

        return when {
            !xForwardedFor.isNullOrBlank() -> xForwardedFor.split(",")[0].trim()
            !xRealIp.isNullOrBlank() -> xRealIp
            !xOriginalForwardedFor.isNullOrBlank() -> xOriginalForwardedFor
            else -> request.remoteAddr
        }
    }
}