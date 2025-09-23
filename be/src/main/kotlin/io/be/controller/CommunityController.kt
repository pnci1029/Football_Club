package io.be.controller

import io.be.service.CommunityPostDetailResponse
import io.be.service.CommunityPostResponse
import io.be.service.CommunityService
import io.be.service.CreateCommunityPostRequest
import io.be.util.ApiResponse
import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import org.springframework.data.domain.Page
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v1/community")
@CrossOrigin(origins = ["*"])
class CommunityController(
    private val communityService: CommunityService
) {

    /**
     * 테스트용 엔드포인트
     */
    @GetMapping("/test")
    fun test(): ResponseEntity<ApiResponse<String>> {
        return ResponseEntity.ok(ApiResponse.success("Community API is working!"))
    }

    /**
     * 커뮤니티 게시글 목록 조회
     */
    @GetMapping("/posts")
    fun getPosts(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(required = false) keyword: String?,
        @RequestParam teamId: Long
    ): ResponseEntity<ApiResponse<Page<CommunityPostResponse>>> {
        val posts = communityService.getPosts(teamId, page, size, keyword)
        return ResponseEntity.ok(ApiResponse.success(posts))
    }

    /**
     * 게시글 상세 조회
     */
    @GetMapping("/posts/{postId}")
    fun getPost(
        @PathVariable postId: Long,
        @RequestParam teamId: Long
    ): ResponseEntity<ApiResponse<CommunityPostDetailResponse>> {
        val post = communityService.getPost(teamId, postId)
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
            teamId = request.teamId
        )
        val post = communityService.createPost(serviceRequest)
        return ResponseEntity.ok(ApiResponse.success(post))
    }

    /*
     * 게시글 수정
     */
    /*
    @PutMapping("/posts/{postId}")
    fun updatePost(
        @PathVariable postId: Long,
        @Valid @RequestBody request: UpdatePostRequest
    ): ResponseEntity<ApiResponse<CommunityPostResponse>> {
        val serviceRequest = UpdateCommunityPostRequest(
            title = request.title,
            content = request.content,
            teamId = request.teamId
        )
        val post = communityService.updatePost(postId, serviceRequest)
        return ResponseEntity.ok(ApiResponse.success(post))
    }
    */

    /*
     * 게시글 삭제
     */
    /*
    @DeleteMapping("/posts/{postId}")
    fun deletePost(
        @PathVariable postId: Long,
        @RequestParam teamId: Long
    ): ResponseEntity<ApiResponse<String>> {
        communityService.deletePost(teamId, postId)
        return ResponseEntity.ok(ApiResponse.success("게시글이 삭제되었습니다."))
    }
    */

    /*
     * 댓글 작성
     */
    /*
    @PostMapping("/posts/{postId}/comments")
    fun createComment(
        @PathVariable postId: Long,
        @Valid @RequestBody request: CreateCommentRequest
    ): ResponseEntity<ApiResponse<CommunityCommentResponse>> {
        val serviceRequest = CreateCommunityCommentRequest(
            content = request.content,
            authorName = request.authorName,
            authorEmail = request.authorEmail,
            teamId = request.teamId
        )
        val comment = communityService.createComment(postId, serviceRequest)
        return ResponseEntity.ok(ApiResponse.success(comment))
    }
    */

    /*
     * 댓글 삭제
     */
    /*
    @DeleteMapping("/comments/{commentId}")
    fun deleteComment(
        @PathVariable commentId: Long,
        @RequestParam teamId: Long
    ): ResponseEntity<ApiResponse<String>> {
        communityService.deleteComment(teamId, commentId)
        return ResponseEntity.ok(ApiResponse.success("댓글이 삭제되었습니다."))
    }
    */

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

/**
 * 게시글 작성 요청 DTO
 */
data class CreatePostRequest(
    @field:NotBlank(message = "제목을 입력해주세요.")
    @field:Size(max = 200, message = "제목은 200자를 초과할 수 없습니다.")
    val title: String,

    @field:NotBlank(message = "내용을 입력해주세요.")
    @field:Size(max = 10000, message = "내용은 10000자를 초과할 수 없습니다.")
    val content: String,

    @field:NotBlank(message = "작성자명을 입력해주세요.")
    @field:Size(max = 50, message = "작성자명은 50자를 초과할 수 없습니다.")
    val authorName: String,

    @field:Size(max = 100, message = "이메일은 100자를 초과할 수 없습니다.")
    val authorEmail: String? = null,

    @field:Size(max = 20, message = "전화번호는 20자를 초과할 수 없습니다.")
    val authorPhone: String? = null,

    val teamId: Long
)

/**
 * 게시글 수정 요청 DTO
 */
data class UpdatePostRequest(
    @field:Size(max = 200, message = "제목은 200자를 초과할 수 없습니다.")
    val title: String? = null,

    @field:Size(max = 10000, message = "내용은 10000자를 초과할 수 없습니다.")
    val content: String? = null,

    val teamId: Long
)

/**
 * 댓글 작성 요청 DTO
 */
data class CreateCommentRequest(
    @field:NotBlank(message = "댓글 내용을 입력해주세요.")
    @field:Size(max = 1000, message = "댓글은 1000자를 초과할 수 없습니다.")
    val content: String,

    @field:NotBlank(message = "작성자명을 입력해주세요.")
    @field:Size(max = 50, message = "작성자명은 50자를 초과할 수 없습니다.")
    val authorName: String,

    @field:Size(max = 100, message = "이메일은 100자를 초과할 수 없습니다.")
    val authorEmail: String? = null,

    val teamId: Long
)
