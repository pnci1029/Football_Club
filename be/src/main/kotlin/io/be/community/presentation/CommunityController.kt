package io.be.community.presentation

import io.be.community.application.CommunityService
import io.be.shared.service.ViewCountService
import io.be.community.dto.*
import io.be.community.domain.CommunityCategory
import io.be.shared.dto.ViewCount
import io.be.shared.dto.IncreaseViewCountRequest
import io.be.shared.util.ApiResponse
import io.be.shared.enums.ContentType
import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import org.slf4j.LoggerFactory
import org.springframework.data.domain.Page
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v1/community")
@CrossOrigin(origins = ["*"])
class CommunityController(
    private val communityService: CommunityService,
    private val viewCountService: ViewCountService
) {

    private val logger = LoggerFactory.getLogger(CommunityController::class.java)

    /**
     * 테스트용 엔드포인트
     */
    @GetMapping("/test")
    fun test(): ResponseEntity<ApiResponse<String>> {
        return ResponseEntity.ok(ApiResponse.success("Community API is working!"))
    }

    /**
     * 커뮤니티 카테고리 목록 조회
     */
    @GetMapping("/categories")
    fun getCategories(): ResponseEntity<ApiResponse<List<Map<String, String>>>> {
        val categories = CommunityCategory.getActiveCategories().map { 
            mapOf(
                "value" to it.name,
                "displayName" to it.displayName
            )
        }
        return ResponseEntity.ok(ApiResponse.success(categories))
    }

    /**
     * 커뮤니티 게시글 목록 조회
     */
    @GetMapping("/posts")
    fun getPosts(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(required = false) keyword: String?,
        @RequestParam(required = false) category: String?,
        @RequestParam teamId: Long
    ): ResponseEntity<ApiResponse<Page<CommunityPostResponse>>> {
        logger.info("GET /posts request - teamId: $teamId, page: $page, size: $size, keyword: $keyword, category: $category")
        val posts = communityService.getPosts(teamId, page, size, keyword, category)
        logger.info("Returning ${posts.content.size} posts out of ${posts.totalElements} total")
        return ResponseEntity.ok(ApiResponse.success(posts))
    }

    /**
     * 게시글 상세 조회
     */
    @GetMapping("/posts/{postId}")
    fun getPost(
        @PathVariable postId: Long,
        @RequestParam teamId: Long,
        httpRequest: HttpServletRequest
    ): ResponseEntity<ApiResponse<CommunityPostDetailResponse>> {
        val post = communityService.getPost(teamId, postId)

        // 조회수 자동 증가 처리
        val clientIp = getClientIpAddress(httpRequest)
        val userAgent = httpRequest.getHeader("User-Agent") ?: ""
        viewCountService.increaseViewCount(ContentType.COMMUNITY, postId, clientIp, userAgent)

        return ResponseEntity.ok(ApiResponse.success(post))
    }

    /**
     * 게시글 작성
     */
    @PostMapping("/posts")
    fun createPost(
        @Valid @RequestBody request: CreatePostRequest
    ): ResponseEntity<ApiResponse<CommunityPostResponse>> {
        val serviceRequest = CreateCommunityPostRequest(
            title = request.title,
            content = request.content,
            authorName = request.authorName,
            authorEmail = request.authorEmail,
            authorPhone = request.authorPhone,
            authorPassword = request.authorPassword,
            category = request.category,
            teamId = request.teamId
        )
        val post = communityService.createPost(serviceRequest)
        return ResponseEntity.ok(ApiResponse.success(post))
    }

    /**
     * 게시글 수정
     */
    @PutMapping("/posts/{postId}")
    fun updatePost(
        @PathVariable postId: Long,
        @Valid @RequestBody request: UpdatePostRequest
    ): ResponseEntity<ApiResponse<CommunityPostResponse>> {
        val serviceRequest = UpdateCommunityPostRequest(
            title = request.title,
            content = request.content,
            authorPassword = request.authorPassword,
            teamId = request.teamId
        )
        val post = communityService.updatePost(postId, serviceRequest)
        return ResponseEntity.ok(ApiResponse.success(post))
    }

    /**
     * 게시글 삭제
     */
    @DeleteMapping("/posts/{postId}")
    fun deletePost(
        @PathVariable postId: Long,
        @RequestParam teamId: Long,
        @RequestParam authorPassword: String
    ): ResponseEntity<ApiResponse<String>> {
        communityService.deletePost(teamId, postId, authorPassword)
        return ResponseEntity.ok(ApiResponse.success("게시글이 삭제되었습니다."))
    }

    /**
     * 댓글 작성
     */
    @PostMapping("/posts/{postId}/comments")
    fun createComment(
        @PathVariable postId: Long,
        @Valid @RequestBody request: CreateCommentRequest
    ): ResponseEntity<ApiResponse<CommunityCommentResponse>> {
        val serviceRequest = CreateCommunityCommentRequest(
            content = request.content,
            authorName = request.authorName,
            authorEmail = request.authorEmail,
            authorPassword = request.authorPassword,
            teamId = request.teamId
        )
        val comment = communityService.createComment(postId, serviceRequest)
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
        communityService.deleteComment(teamId, commentId, authorPassword)
        return ResponseEntity.ok(ApiResponse.success("댓글이 삭제되었습니다."))
    }

    /**
     * 게시글 작성자 권한 확인 - 보안 강화
     */
    @PostMapping("/posts/{postId}/ownership")
    fun checkPostOwnership(
        @PathVariable postId: Long,
        @RequestBody ownershipRequest: OwnershipCheckRequest,
        httpRequest: HttpServletRequest
    ): ResponseEntity<ApiResponse<OwnershipCheckResponse>> {
        val clientIp = getClientIpAddress(httpRequest)
        logger.info("Post ownership check attempt - postId: $postId, teamId: ${ownershipRequest.teamId}, clientIp: $clientIp")

        val isOwner = communityService.checkPostOwnership(postId, ownershipRequest.teamId, ownershipRequest.authorPassword, clientIp)

        return ResponseEntity.ok(ApiResponse.success(OwnershipCheckResponse(
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
        @RequestBody ownershipRequest: OwnershipCheckRequest,
        httpRequest: HttpServletRequest
    ): ResponseEntity<ApiResponse<OwnershipCheckResponse>> {
        val clientIp = getClientIpAddress(httpRequest)
        logger.info("Comment ownership check attempt - commentId: $commentId, teamId: ${ownershipRequest.teamId}, clientIp: $clientIp")

        val isOwner = communityService.checkCommentOwnership(commentId, ownershipRequest.teamId, ownershipRequest.authorPassword, clientIp)

        return ResponseEntity.ok(ApiResponse.success(OwnershipCheckResponse(
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

