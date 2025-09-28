package io.be.controller

import io.be.service.AllNoticeService
import io.be.dto.*
import io.be.util.ApiResponse
import org.slf4j.LoggerFactory
import org.springframework.data.domain.Page
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v1/all-notices")
@CrossOrigin(origins = ["*"])
class AllNoticeController(
    private val allNoticeService: AllNoticeService
) {

    private val logger = LoggerFactory.getLogger(AllNoticeController::class.java)

    /**
     * 전체 팀의 공지사항 목록 조회
     */
    @GetMapping
    fun getAllNotices(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(required = false) teamId: Long?,
        @RequestParam(required = false) keyword: String?
    ): ResponseEntity<ApiResponse<Page<AllNoticeResponse>>> {
        logger.info("GET /all-notices request - teamId: $teamId, page: $page, size: $size, keyword: $keyword")
        
        val notices = allNoticeService.getAllNotices(page, size, teamId, keyword)
        logger.info("Returning ${notices.content.size} notices out of ${notices.totalElements} total from all teams")
        
        return ResponseEntity.ok(ApiResponse.success(notices))
    }

    /**
     * 활성 팀 목록 조회 (공지사항 필터링용)
     */
    @GetMapping("/teams")
    fun getActiveTeams(): ResponseEntity<ApiResponse<List<TeamInfoResponse>>> {
        logger.info("GET /all-notices/teams request")
        
        val teams = allNoticeService.getActiveTeams()
        logger.info("Returning ${teams.size} active teams")
        
        return ResponseEntity.ok(ApiResponse.success(teams))
    }
}