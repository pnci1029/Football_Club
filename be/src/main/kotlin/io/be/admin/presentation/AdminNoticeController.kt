package io.be.admin.presentation

import io.be.admin.dto.AdminInfo
import io.be.admin.domain.AdminLevel
import io.be.notice.application.NoticeService
import io.be.notice.dto.*
import io.be.shared.exception.UnauthorizedAdminAccessException
import io.be.shared.security.AdminPermissionRequired
import io.be.shared.util.ApiResponse
import io.be.team.application.TeamService
import jakarta.validation.Valid
import org.slf4j.LoggerFactory
import org.springframework.data.domain.Page
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v1/admin/notices")
@CrossOrigin(origins = ["*"])
class AdminNoticeController(
    private val noticeService: NoticeService,
    private val teamService: TeamService
) {

    private val logger = LoggerFactory.getLogger(AdminNoticeController::class.java)

    /**
     * 관리자용 전체 공지사항 목록 조회
     */
    @AdminPermissionRequired(level = AdminLevel.SUBDOMAIN)
    @GetMapping
    fun getAllNotices(
        adminInfo: AdminInfo,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(required = false) keyword: String?
    ): ResponseEntity<ApiResponse<Page<AllNoticeResponse>>> {
        logger.info("Admin GET /notices request - page: $page, size: $size, keyword: $keyword")
        
        val notices = when (adminInfo.adminLevel) {
            AdminLevel.MASTER -> {
                // 마스터는 모든 공지사항 조회 가능
                noticeService.getAllNotices(page, size, keyword)
            }
            AdminLevel.SUBDOMAIN -> {
                // 서브도메인 관리자는 자신의 팀 공지사항만 조회
                val team = teamService.findByCode(adminInfo.teamSubdomain!!)
                    ?: throw UnauthorizedAdminAccessException("Invalid team subdomain")
                
                noticeService.getAllNotices(page, size, keyword, team.id)
            }
        }
        
        logger.info("Returning ${notices.content.size} notices out of ${notices.totalElements} total")
        return ResponseEntity.ok(ApiResponse.success(notices))
    }

    /**
     * 관리자용 팀별 공지사항 목록 조회
     */
    @AdminPermissionRequired(level = AdminLevel.SUBDOMAIN)
    @GetMapping("/team/{teamId}")
    fun getNoticesByTeam(
        adminInfo: AdminInfo,
        @PathVariable teamId: Long,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(required = false) keyword: String?
    ): ResponseEntity<ApiResponse<Page<NoticeResponse>>> {
        logger.info("Admin GET /notices/team/$teamId request - page: $page, size: $size, keyword: $keyword")
        
        // 서브도메인 관리자는 자신의 팀만 접근 가능
        if (adminInfo.adminLevel == AdminLevel.SUBDOMAIN) {
            val team = teamService.findByCode(adminInfo.teamSubdomain!!)
                ?: throw UnauthorizedAdminAccessException("Invalid team subdomain")
            
            if (teamId != team.id) {
                throw UnauthorizedAdminAccessException("Subdomain admin can only access their own team notices")
            }
        }
        
        val notices = noticeService.getNotices(teamId, page, size, keyword)
        logger.info("Returning ${notices.content.size} notices out of ${notices.totalElements} total")
        return ResponseEntity.ok(ApiResponse.success(notices))
    }

    /**
     * 관리자용 공지사항 상세 조회
     */
    @AdminPermissionRequired(level = AdminLevel.SUBDOMAIN)
    @GetMapping("/{noticeId}")
    fun getNotice(
        adminInfo: AdminInfo,
        @PathVariable noticeId: Long,
        @RequestParam teamId: Long
    ): ResponseEntity<ApiResponse<NoticeDetailResponse>> {
        logger.info("Admin GET /notices/$noticeId request - teamId: $teamId")
        
        // 서브도메인 관리자는 자신의 팀만 접근 가능
        if (adminInfo.adminLevel == AdminLevel.SUBDOMAIN) {
            val team = teamService.findByCode(adminInfo.teamSubdomain!!)
                ?: throw UnauthorizedAdminAccessException("Invalid team subdomain")
            
            if (teamId != team.id) {
                throw UnauthorizedAdminAccessException("Subdomain admin can only access their own team notices")
            }
        }
        
        val notice = noticeService.getNotice(teamId, noticeId)
        return ResponseEntity.ok(ApiResponse.success(notice))
    }

    /**
     * 관리자용 공지사항 작성
     */
    @AdminPermissionRequired(level = AdminLevel.SUBDOMAIN)
    @PostMapping
    fun createNotice(
        adminInfo: AdminInfo,
        @Valid @RequestBody request: CreateNoticeRequestDto
    ): ResponseEntity<ApiResponse<NoticeResponse>> {
        logger.info("Admin POST /notices request - teamId: ${request.teamId}, title: ${request.title}")
        
        // 서브도메인 관리자는 자신의 팀에만 공지사항 작성 가능
        if (adminInfo.adminLevel == AdminLevel.SUBDOMAIN) {
            val team = teamService.findByCode(adminInfo.teamSubdomain!!)
                ?: throw UnauthorizedAdminAccessException("Invalid team subdomain")
            
            if (request.teamId != team.id) {
                throw UnauthorizedAdminAccessException("Subdomain admin can only create notices for their own team")
            }
        }
        
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
    @AdminPermissionRequired(level = AdminLevel.SUBDOMAIN)
    @DeleteMapping("/{noticeId}")
    fun deleteNotice(
        adminInfo: AdminInfo,
        @PathVariable noticeId: Long,
        @RequestParam teamId: Long
    ): ResponseEntity<ApiResponse<String>> {
        logger.info("Admin DELETE /notices/$noticeId request - teamId: $teamId")
        
        // 서브도메인 관리자는 자신의 팀 공지사항만 삭제 가능
        if (adminInfo.adminLevel == AdminLevel.SUBDOMAIN) {
            val team = teamService.findByCode(adminInfo.teamSubdomain!!)
                ?: throw UnauthorizedAdminAccessException("Invalid team subdomain")
            
            if (teamId != team.id) {
                throw UnauthorizedAdminAccessException("Subdomain admin can only delete notices from their own team")
            }
        }
        
        noticeService.adminDeleteNotice(teamId, noticeId)
        return ResponseEntity.ok(ApiResponse.success("공지사항이 삭제되었습니다."))
    }

    /**
     * 관리자용 댓글 삭제 (비밀번호 불필요)
     */
    @AdminPermissionRequired(level = AdminLevel.SUBDOMAIN)
    @DeleteMapping("/comments/{commentId}")
    fun deleteComment(
        adminInfo: AdminInfo,
        @PathVariable commentId: Long,
        @RequestParam teamId: Long
    ): ResponseEntity<ApiResponse<String>> {
        logger.info("Admin DELETE /notices/comments/$commentId request - teamId: $teamId")
        
        // 서브도메인 관리자는 자신의 팀 댓글만 삭제 가능
        if (adminInfo.adminLevel == AdminLevel.SUBDOMAIN) {
            val team = teamService.findByCode(adminInfo.teamSubdomain!!)
                ?: throw UnauthorizedAdminAccessException("Invalid team subdomain")
            
            if (teamId != team.id) {
                throw UnauthorizedAdminAccessException("Subdomain admin can only delete comments from their own team")
            }
        }
        
        noticeService.adminDeleteComment(teamId, commentId)
        return ResponseEntity.ok(ApiResponse.success("댓글이 삭제되었습니다."))
    }
}