package io.be.gallery.presentation

import io.be.gallery.application.GalleryService
import io.be.gallery.dto.*
import io.be.gallery.domain.GalleryCategory
import io.be.gallery.domain.PlayType
import io.be.shared.util.ApiResponse
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

/**
 * Public 갤러리 조회 API
 */
@RestController
@RequestMapping("/v1/gallery")
@CrossOrigin(origins = ["*"])
class GalleryController(
    private val galleryService: GalleryService
) {

    /**
     * 갤러리 목록 조회 (페이징, 검색, 필터링)
     */
    @GetMapping
    fun getGalleries(
        @RequestParam(required = false) keyword: String?,
        @RequestParam(required = false) category: GalleryCategory?,
        @RequestParam(required = false) tags: List<String>?,
        @RequestParam(required = false) startDate: String?,
        @RequestParam(required = false) endDate: String?,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "12") size: Int,
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
     * 갤러리 상세 조회
     */
    @GetMapping("/{id}")
    fun getGallery(
        @PathVariable id: Long
    ): ApiResponse<GalleryDetailDto> {
        val gallery = galleryService.getGalleryDetail(id)
        return ApiResponse.success(gallery)
    }

    /**
     * 추천 갤러리 조회
     */
    @GetMapping("/featured")
    fun getFeaturedGalleries(): ApiResponse<List<GalleryDto>> {
        val galleries = galleryService.getFeaturedGalleries()
        return ApiResponse.success(galleries)
    }

    /**
     * 인기 갤러리 조회
     */
    @GetMapping("/popular")
    fun getPopularGalleries(
        @RequestParam(defaultValue = "10") limit: Int
    ): ApiResponse<List<PopularGalleryDto>> {
        val galleries = galleryService.getPopularGalleries(limit)
        return ApiResponse.success(galleries)
    }

    /**
     * 최신 갤러리 조회
     */
    @GetMapping("/recent")
    fun getRecentGalleries(
        @RequestParam(defaultValue = "6") limit: Int
    ): ApiResponse<List<RecentGalleryDto>> {
        val galleries = galleryService.getRecentGalleries(limit)
        return ApiResponse.success(galleries)
    }

    /**
     * 하이라이트 갤러리 조회
     */
    @GetMapping("/highlights")
    fun getHighlightGalleries(
        @RequestParam(required = false) playType: PlayType?,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "12") size: Int
    ): ApiResponse<*> {
        val galleries = galleryService.getHighlightGalleries(playType, 0, page, size)
        return ApiResponse.success(galleries)
    }

    /**
     * 팀별 태그 목록 조회
     */
    @GetMapping("/tags")
    fun getTagsByTeam(): ApiResponse<List<String>> {
        val tags = galleryService.getTagsByTeam()
        return ApiResponse.success(tags)
    }

    /**
     * 인기 태그 조회
     */
    @GetMapping("/tags/popular")
    fun getPopularTags(
        @RequestParam(defaultValue = "20") limit: Int
    ): ApiResponse<List<TagStatDto>> {
        val tags = galleryService.getPopularTags(limit)
        return ApiResponse.success(tags)
    }

    /**
     * 갤러리 생성
     */
    @PostMapping
    fun createGallery(@RequestBody request: CreateGalleryRequest): ApiResponse<GalleryDto> {
        val gallery = galleryService.createGallery(request, emptyList())
        return ApiResponse.success(gallery)
    }

    /**
     * 갤러리 수정
     */
    @PutMapping("/{id}")
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
    fun deleteGallery(@PathVariable id: Long): ApiResponse<String> {
        galleryService.deleteGallery(id)
        return ApiResponse.success("갤러리가 삭제되었습니다.")
    }

    /**
     * 갤러리에 미디어 파일 업로드
     */
    @PostMapping("/{id}/media")
    fun uploadMedia(
        @PathVariable id: Long,
        @RequestParam("files") files: List<MultipartFile>
    ): ApiResponse<List<GalleryMediaDto>> {
        val mediaList = galleryService.addMediaToGallery(id, files)
        return ApiResponse.success(mediaList)
    }

    /**
     * 미디어 파일 삭제
     */
    @DeleteMapping("/{galleryId}/media/{mediaId}")
    fun deleteMedia(
        @PathVariable galleryId: Long,
        @PathVariable mediaId: Long
    ): ApiResponse<String> {
        galleryService.deleteMedia(mediaId)
        return ApiResponse.success("미디어가 삭제되었습니다.")
    }
}
