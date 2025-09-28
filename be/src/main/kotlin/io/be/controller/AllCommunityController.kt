package io.be.controller

import io.be.service.AllCommunityService
import io.be.dto.*
import io.be.util.ApiResponse
import org.slf4j.LoggerFactory
import org.springframework.data.domain.Page
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v1/all-community")
@CrossOrigin(origins = ["*"])
class AllCommunityController(
    private val allCommunityService: AllCommunityService
) {

    private val logger = LoggerFactory.getLogger(AllCommunityController::class.java)

    /**
     * 전체 팀의 커뮤니티 게시글 목록 조회
     */
    @GetMapping("/posts")
    fun getAllCommunityPosts(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(required = false) teamId: Long?,
        @RequestParam(required = false) keyword: String?
    ): ResponseEntity<ApiResponse<Page<AllCommunityPostResponse>>> {
        logger.info("GET /all-community/posts request - teamId: $teamId, page: $page, size: $size, keyword: $keyword")
        
        val posts = allCommunityService.getAllCommunityPosts(page, size, teamId, keyword)
        logger.info("Returning ${posts.content.size} community posts out of ${posts.totalElements} total from all teams")
        
        return ResponseEntity.ok(ApiResponse.success(posts))
    }

    /**
     * 활성 팀 목록 조회 (커뮤니티 필터링용)
     */
    @GetMapping("/teams")
    fun getActiveTeams(): ResponseEntity<ApiResponse<List<TeamInfoResponse>>> {
        logger.info("GET /all-community/teams request")
        
        val teams = allCommunityService.getActiveTeams()
        logger.info("Returning ${teams.size} active teams")
        
        return ResponseEntity.ok(ApiResponse.success(teams))
    }
}