package io.be.gallery.presentation

import io.be.gallery.application.GalleryService
import io.be.gallery.dto.*
import io.be.gallery.domain.GalleryCategory
import io.be.shared.util.ApiResponse
import io.be.shared.security.AdminPermissionRequired
import io.be.admin.domain.AdminLevel
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

data class MediaOrderDto(
    val mediaId: Long,
    val sortOrder: Int
)

/**
 * 관리자 갤러리 관리 API
 */
@RestController
@RequestMapping("/v1/admin/gallery")
@CrossOrigin(origins = ["*"])
class AdminGalleryController(
    private val galleryService: GalleryService
) {

    /**
     * 관리자 갤러리 목록 조회 (모든 갤러리 포함)
     */
    @GetMapping
    @AdminPermissionRequired(AdminLevel.SUBDOMAIN)
    fun getGalleries(
        @RequestParam(required = false) keyword: String?,
        @RequestParam(required = false) category: GalleryCategory?,
        @RequestParam(required = false) tags: List<String>?,
        @RequestParam(required = false) startDate: String?,
        @RequestParam(required = false) endDate: String?,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(defaultValue = "createdAt") sortBy: String?,
        @RequestParam(defaultValue = "desc") sortDirection: String?
    ): ApiResponse<*> {

        val searchRequest = GallerySearchRequest(
            keyword = keyword,
            category = category,
            tags = tags?.takeIf { it.isNotEmpty() },
            startDate = startDate,
            endDate = endDate,
            page = page,
            size = size,
            sortBy = sortBy ?: "createdAt",
            sortDirection = sortDirection ?: "desc"
        )

        val galleries = galleryService.getGalleries(searchRequest)
        return ApiResponse.success(galleries)
    }

    /**
     * 갤러리 생성
     */
    @PostMapping
    @AdminPermissionRequired(AdminLevel.SUBDOMAIN)
    fun createGallery(
        @RequestBody request: CreateGalleryRequest,
        @RequestParam("files", required = false) files: List<MultipartFile>?
    ): ApiResponse<GalleryDto> {
        val gallery = galleryService.createGallery(request, files ?: emptyList())
        return ApiResponse.success(gallery)
    }

    /**
     * 갤러리 수정
     */
    @PutMapping("/{id}")
    @AdminPermissionRequired(AdminLevel.SUBDOMAIN)
    fun updateGallery(
        @PathVariable id: Long,
        @RequestBody request: UpdateGalleryRequest
    ): ApiResponse<GalleryDto> {
        val gallery = galleryService.updateGallery(id, request)
        return ApiResponse.success(gallery)
    }

    /**
     * 갤러리 삭제
     */
    @DeleteMapping("/{id}")
    @AdminPermissionRequired(AdminLevel.SUBDOMAIN)
    fun deleteGallery(
        @PathVariable id: Long
    ): ApiResponse<Unit> {
        galleryService.deleteGallery(id)
        return ApiResponse.success(Unit)
    }

    /**
     * 미디어 파일 업로드
     */
    @PostMapping("/{galleryId}/media")
    @AdminPermissionRequired(AdminLevel.SUBDOMAIN)
    fun uploadMediaFiles(
        @PathVariable galleryId: Long,
        @RequestParam("files") files: List<MultipartFile>
    ): ApiResponse<List<GalleryMediaDto>> {
        val mediaList = galleryService.addMediaToGallery(galleryId, files)
        return ApiResponse.success(mediaList)
    }

    /**
     * 미디어 파일 삭제
     */
    @DeleteMapping("/{galleryId}/media/{mediaId}")
    @AdminPermissionRequired(AdminLevel.SUBDOMAIN)
    fun deleteMediaFile(
        @PathVariable galleryId: Long,
        @PathVariable mediaId: Long
    ): ApiResponse<Unit> {
        galleryService.deleteMedia(mediaId)
        return ApiResponse.success(Unit)
    }

    /**
     * 미디어 파일 순서 변경 (향후 구현)
     */
    @PutMapping("/{galleryId}/media/order")
    @AdminPermissionRequired(AdminLevel.SUBDOMAIN)
    fun updateMediaOrder(
        @PathVariable galleryId: Long,
        @RequestBody mediaOrders: List<MediaOrderDto>
    ): ApiResponse<Unit> {
        // TODO: 미디어 순서 변경 로직 구현
        return ApiResponse.success(Unit)
    }

    /**
     * 갤러리 통계 조회
     */
    @GetMapping("/statistics")
    @AdminPermissionRequired(AdminLevel.SUBDOMAIN)
    fun getGalleryStatistics(): ApiResponse<GalleryStatisticsDto> {
        val statistics = galleryService.getGalleryStatistics()
        return ApiResponse.success(statistics)
    }

    /**
     * 갤러리 활성화/비활성화 토글 (향후 구현)
     */
    @PatchMapping("/{id}/toggle-status")
    @AdminPermissionRequired(AdminLevel.SUBDOMAIN)
    fun toggleGalleryStatus(
        @PathVariable id: Long
    ): ApiResponse<Unit> {
        // TODO: 갤러리 상태 토글 로직 구현
        return ApiResponse.success(Unit)
    }
}
