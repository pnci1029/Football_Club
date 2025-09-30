package io.be.controller.admin

import io.be.service.NoticeService
import io.be.dto.*
import io.be.util.ApiResponse
import jakarta.validation.Valid
import org.slf4j.LoggerFactory
import org.springframework.data.domain.Page
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v1/admin/notices")
@CrossOrigin(origins = ["*"])
class AdminNoticeController(
    private val noticeService: NoticeService
) {

    private val logger = LoggerFactory.getLogger(AdminNoticeController::class.java)

    /**
     * 관리자용 전체 공지사항 목록 조회
     */
    @GetMapping
    fun getAllNotices(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(required = false) keyword: String?
    ): ResponseEntity<ApiResponse<Page<AllNoticeResponse>>> {
        logger.info("Admin GET /notices request - page: $page, size: $size, keyword: $keyword")
        val notices = noticeService.getAllNotices(page, size, keyword)
        logger.info("Returning ${notices.content.size} notices out of ${notices.totalElements} total")
        return ResponseEntity.ok(ApiResponse.success(notices))
    }

    /**
     * 관리자용 팀별 공지사항 목록 조회
     */
    @GetMapping("/team/{teamId}")
    fun getNoticesByTeam(
        @PathVariable teamId: Long,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(required = false) keyword: String?
    ): ResponseEntity<ApiResponse<Page<NoticeResponse>>> {
        logger.info("Admin GET /notices/team/$teamId request - page: $page, size: $size, keyword: $keyword")
        val notices = noticeService.getNotices(teamId, page, size, keyword)
        logger.info("Returning ${notices.content.size} notices out of ${notices.totalElements} total")
        return ResponseEntity.ok(ApiResponse.success(notices))
    }

    /**
     * 관리자용 공지사항 상세 조회
     */
    @GetMapping("/{noticeId}")
    fun getNotice(
        @PathVariable noticeId: Long,
        @RequestParam teamId: Long
    ): ResponseEntity<ApiResponse<NoticeDetailResponse>> {
        logger.info("Admin GET /notices/$noticeId request - teamId: $teamId")
        val notice = noticeService.getNotice(teamId, noticeId)
        return ResponseEntity.ok(ApiResponse.success(notice))
    }

    /**
     * 관리자용 공지사항 작성
     */
    @PostMapping
    fun createNotice(
        @Valid @RequestBody request: CreateNoticeRequestDto
    ): ResponseEntity<ApiResponse<NoticeResponse>> {
        logger.info("Admin POST /notices request - teamId: ${request.teamId}, title: ${request.title}")
        val serviceRequest = CreateNoticeRequest(
            title = request.title,
            content = request.content,
            authorName = request.authorName,
            authorEmail = request.authorEmail,
            authorPhone = request.authorPhone,
            authorPassword = request.authorPassword,
            teamId = request.teamId,
            isGlobalVisible = request.isGlobalVisible
        )
        val notice = noticeService.createNotice(serviceRequest)
        return ResponseEntity.ok(ApiResponse.success(notice))
    }

    /**
     * 관리자용 공지사항 수정 (비밀번호 불필요)
     */
    @PutMapping("/{noticeId}")
    fun updateNotice(
        @PathVariable noticeId: Long,
        @Valid @RequestBody request: AdminUpdateNoticeRequestDto
    ): ResponseEntity<ApiResponse<NoticeResponse>> {
        logger.info("Admin PUT /notices/$noticeId request - teamId: ${request.teamId}")
        val notice = noticeService.adminUpdateNotice(noticeId, request.teamId, request.title, request.content, request.isGlobalVisible)
        return ResponseEntity.ok(ApiResponse.success(notice))
    }

    /**
     * 관리자용 공지사항 삭제 (비밀번호 불필요)
     */
    @DeleteMapping("/{noticeId}")
    fun deleteNotice(
        @PathVariable noticeId: Long,
        @RequestParam teamId: Long
    ): ResponseEntity<ApiResponse<String>> {
        logger.info("Admin DELETE /notices/$noticeId request - teamId: $teamId")
        noticeService.adminDeleteNotice(teamId, noticeId)
        return ResponseEntity.ok(ApiResponse.success("공지사항이 삭제되었습니다."))
    }

    /**
     * 관리자용 댓글 삭제 (비밀번호 불필요)
     */
    @DeleteMapping("/comments/{commentId}")
    fun deleteComment(
        @PathVariable commentId: Long,
        @RequestParam teamId: Long
    ): ResponseEntity<ApiResponse<String>> {
        logger.info("Admin DELETE /notices/comments/$commentId request - teamId: $teamId")
        noticeService.adminDeleteComment(teamId, commentId)
        return ResponseEntity.ok(ApiResponse.success("댓글이 삭제되었습니다."))
    }
}