package io.be.admin.presentation

import io.be.admin.application.AdminCommunityService
import io.be.admin.dto.AdminCommunityPostResponse
import io.be.admin.dto.AdminCommunityPostDetailResponse
import io.be.admin.dto.CreateNoticePostRequest
import io.be.admin.dto.AdminInfo
import io.be.admin.domain.AdminLevel
import io.be.admin.dto.AdminActionRequest
import io.be.admin.dto.CommunityStatsResponse
import io.be.shared.util.ApiResponse
import io.be.shared.security.AdminPermissionRequired
import org.slf4j.LoggerFactory
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.web.PageableDefault
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import jakarta.servlet.http.HttpServletRequest

/**
 * 관리자 전용: 커뮤니티 관리 컨트롤러
 */
@RestController
@RequestMapping("/v1/admin/community")
@AdminPermissionRequired(level = AdminLevel.SUBDOMAIN)
class AdminCommunityController(
    private val adminCommunityService: AdminCommunityService
) {
    
    private val logger = LoggerFactory.getLogger(AdminCommunityController::class.java)
    
    /**
     * 관리자용 게시글 목록 조회
     */
    @GetMapping("/posts")
    fun getPostsForAdmin(
        @RequestParam(required = false) teamId: Long?,
        @RequestParam(defaultValue = "false") includeInactive: Boolean,
        @PageableDefault(size = 20) pageable: Pageable,
        request: HttpServletRequest
    ): ResponseEntity<ApiResponse<Page<AdminCommunityPostResponse>>> {
        
        val adminInfo = request.getAttribute("adminInfo") as AdminInfo
        logger.info("Admin ${adminInfo.username} requested community posts (teamId=$teamId, includeInactive=$includeInactive)")
        
        val posts = adminCommunityService.getPostsForAdmin(adminInfo, teamId, includeInactive, pageable)
        return ResponseEntity.ok(ApiResponse.success(posts))
    }
    
    /**
     * 관리자용 게시글 상세 조회
     */
    @GetMapping("/posts/{postId}")
    fun getPostDetailForAdmin(
        @PathVariable postId: Long,
        request: HttpServletRequest
    ): ResponseEntity<ApiResponse<AdminCommunityPostDetailResponse>> {
        
        val adminInfo = request.getAttribute("adminInfo") as AdminInfo
        logger.info("Admin ${adminInfo.username} requested post detail: $postId")
        
        val postDetail = adminCommunityService.getPostDetailForAdmin(postId, adminInfo)
        return ResponseEntity.ok(ApiResponse.success(postDetail))
    }
    
    /**
     * 게시글 비활성화 (관리자용 삭제)
     */
    @PatchMapping("/posts/{postId}/deactivate")
    fun deactivatePost(
        @PathVariable postId: Long,
        @RequestBody(required = false) request: AdminActionRequest?,
        httpRequest: HttpServletRequest
    ): ResponseEntity<ApiResponse<String>> {
        
        val adminInfo = httpRequest.getAttribute("adminInfo") as AdminInfo
        logger.info("Admin ${adminInfo.username} deactivating post: $postId")
        
        adminCommunityService.deactivatePost(postId, adminInfo, request?.reason)
        return ResponseEntity.ok(ApiResponse.success("Post deactivated successfully"))
    }
    
    /**
     * 게시글 활성화 (복구)
     */
    @PatchMapping("/posts/{postId}/activate")
    fun activatePost(
        @PathVariable postId: Long,
        request: HttpServletRequest
    ): ResponseEntity<ApiResponse<String>> {
        
        val adminInfo = request.getAttribute("adminInfo") as AdminInfo
        logger.info("Admin ${adminInfo.username} activating post: $postId")
        
        adminCommunityService.activatePost(postId, adminInfo)
        return ResponseEntity.ok(ApiResponse.success("Post activated successfully"))
    }
    
    /**
     * 댓글 비활성화 (관리자용 삭제)
     */
    @PatchMapping("/comments/{commentId}/deactivate")
    fun deactivateComment(
        @PathVariable commentId: Long,
        @RequestBody(required = false) request: AdminActionRequest?,
        httpRequest: HttpServletRequest
    ): ResponseEntity<ApiResponse<String>> {
        
        val adminInfo = httpRequest.getAttribute("adminInfo") as AdminInfo
        logger.info("Admin ${adminInfo.username} deactivating comment: $commentId")
        
        adminCommunityService.deactivateComment(commentId, adminInfo, request?.reason)
        return ResponseEntity.ok(ApiResponse.success("Comment deactivated successfully"))
    }
    
    /**
     * 댓글 활성화 (복구)
     */
    @PatchMapping("/comments/{commentId}/activate")
    fun activateComment(
        @PathVariable commentId: Long,
        request: HttpServletRequest
    ): ResponseEntity<ApiResponse<String>> {
        
        val adminInfo = request.getAttribute("adminInfo") as AdminInfo
        logger.info("Admin ${adminInfo.username} activating comment: $commentId")
        
        adminCommunityService.activateComment(commentId, adminInfo)
        return ResponseEntity.ok(ApiResponse.success("Comment activated successfully"))
    }
    
    /**
     * 공지사항 게시글 생성
     */
    @PostMapping("/notices")
    fun createNoticePost(
        @RequestBody request: CreateNoticePostRequest,
        httpRequest: HttpServletRequest
    ): ResponseEntity<ApiResponse<AdminCommunityPostResponse>> {
        
        val adminInfo = httpRequest.getAttribute("adminInfo") as AdminInfo
        logger.info("Admin ${adminInfo.username} creating notice post: ${request.title}")
        
        val noticePost = adminCommunityService.createNoticePost(request, adminInfo)
        return ResponseEntity.ok(ApiResponse.success(noticePost))
    }
    
    /**
     * 커뮤니티 관리 통계 조회
     */
    @GetMapping("/stats")
    fun getCommunityStats(
        @RequestParam(required = false) teamId: Long?,
        request: HttpServletRequest
    ): ResponseEntity<ApiResponse<CommunityStatsResponse>> {
        
        val adminInfo = request.getAttribute("adminInfo") as AdminInfo
        logger.info("Admin ${adminInfo.username} requested community stats (teamId=$teamId)")
        
        // 현재는 기본 통계만 제공, 향후 확장 가능
        val stats = CommunityStatsResponse(
            message = "Community statistics feature will be implemented soon",
            adminLevel = adminInfo.adminLevel.toString(),
            accessibleTeam = adminInfo.teamSubdomain ?: "ALL"
        )
        
        return ResponseEntity.ok(ApiResponse.success(stats))
    }
}

