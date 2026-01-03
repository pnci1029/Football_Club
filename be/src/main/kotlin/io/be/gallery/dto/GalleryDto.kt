package io.be.gallery.dto

import io.be.gallery.domain.GalleryCategory
import io.be.gallery.domain.MediaType
import io.be.gallery.domain.PlayType
import java.time.LocalDateTime

/**
 * 갤러리 목록용 DTO
 */
data class GalleryDto(
    val id: Long,
    val title: String,
    val description: String?,
    val category: GalleryCategory,
    val categoryDisplayName: String,
    val coverImageUrl: String?,
    val mediaCount: Int,
    val imageCount: Int,
    val videoCount: Int,
    val viewCount: Int,
    val isFeatured: Boolean,
    val createdBy: String?,
    val createdAt: LocalDateTime,
    val tags: List<String>
)

/**
 * 갤러리 상세용 DTO
 */
data class GalleryDetailDto(
    val id: Long,
    val title: String,
    val description: String?,
    val category: GalleryCategory,
    val categoryDisplayName: String,
    val viewCount: Int,
    val isFeatured: Boolean,
    val createdBy: String?,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
    val mediaFiles: List<GalleryMediaDto>,
    val tags: List<String>,
    val highlightMetadata: HighlightMetadataDto?
)

/**
 * 갤러리 미디어 DTO
 */
data class GalleryMediaDto(
    val id: Long,
    val fileName: String,
    val originalFileName: String,
    val fileUrl: String,
    val thumbnailUrl: String?,
    val fileSize: Long,
    val fileSizeFormatted: String, // "2.5 MB" 형태
    val mediaType: MediaType,
    val width: Int?,
    val height: Int?,
    val duration: Int?, // 비디오 길이 (초)
    val durationFormatted: String?, // "02:35" 형태
    val isCover: Boolean,
    val sortOrder: Int,
    val uploadedAt: LocalDateTime
)

/**
 * 하이라이트 메타데이터 DTO
 */
data class HighlightMetadataDto(
    val id: Long,
    val matchId: Long?,
    val playType: PlayType,
    val playTypeDisplayName: String,
    val playerNames: String?,
    val gameMinute: Int?,
    val gameMinuteFormatted: String?, // "45+2'" 형태
    val description: String?,
    val highlightRating: Int
)

/**
 * 갤러리 생성 요청 DTO
 */
data class CreateGalleryRequest(
    val teamId: Long,
    val title: String,
    val description: String?,
    val category: GalleryCategory,
    val tags: List<String>?,
    val isFeatured: Boolean = false,
    val createdBy: String?,
    // 하이라이트 관련 (카테고리가 HIGHLIGHT인 경우)
    val highlightMetadata: CreateHighlightMetadataRequest?
)

/**
 * 하이라이트 메타데이터 생성 요청 DTO
 */
data class CreateHighlightMetadataRequest(
    val matchId: Long?,
    val playType: PlayType,
    val playerNames: String?,
    val gameMinute: Int?,
    val description: String?,
    val highlightRating: Int = 0
)

/**
 * 갤러리 수정 요청 DTO
 */
data class UpdateGalleryRequest(
    val title: String,
    val description: String?,
    val category: GalleryCategory,
    val tags: List<String>?,
    val isFeatured: Boolean,
    val highlightMetadata: UpdateHighlightMetadataRequest?
)

/**
 * 하이라이트 메타데이터 수정 요청 DTO
 */
data class UpdateHighlightMetadataRequest(
    val matchId: Long?,
    val playType: PlayType,
    val playerNames: String?,
    val gameMinute: Int?,
    val description: String?,
    val highlightRating: Int
)

/**
 * 갤러리 카테고리 DTO
 */
data class CategoryDto(
    val code: String,
    val displayName: String,
    val description: String
)

/**
 * 갤러리 통계 DTO
 */
data class GalleryStatisticsDto(
    val totalGalleryCount: Long,
    val totalImageCount: Long,
    val totalVideoCount: Long,
    val totalViewCount: Int,
    val totalStorageUsed: String, // "125.6 MB" 형태
    val thisMonthGalleryCount: Long,
    val categoryStats: List<CategoryStatDto>,
    val popularTags: List<TagStatDto>
)

/**
 * 카테고리별 통계 DTO
 */
data class CategoryStatDto(
    val category: GalleryCategory,
    val displayName: String,
    val count: Long,
    val percentage: Double
)

/**
 * 태그별 통계 DTO
 */
data class TagStatDto(
    val tagName: String,
    val count: Long,
    val percentage: Double
)

/**
 * 갤러리 검색 요청 DTO
 */
data class GallerySearchRequest(
    val keyword: String? = null,
    val category: GalleryCategory? = null,
    val tags: List<String>? = null,
    val startDate: String? = null, // "2024-01-01" 형태
    val endDate: String? = null,
    val playType: PlayType? = null, // 하이라이트 검색용
    val minRating: Int? = null, // 하이라이트 최소 평점
    val page: Int = 0,
    val size: Int = 12,
    val sortBy: String = "created", // created, views, rating
    val sortDirection: String = "desc" // asc, desc
)

/**
 * 미디어 파일 업로드 응답 DTO
 */
data class MediaUploadResponse(
    val mediaFiles: List<GalleryMediaDto>,
    val totalCount: Int,
    val totalSize: String,
    val uploadedAt: LocalDateTime
)

/**
 * 인기 갤러리 DTO (홈 대시보드용)
 */
data class PopularGalleryDto(
    val id: Long,
    val title: String,
    val category: GalleryCategory,
    val categoryDisplayName: String,
    val coverImageUrl: String?,
    val viewCount: Int,
    val createdAt: LocalDateTime
)

/**
 * 최근 갤러리 DTO (홈 대시보드용)
 */
data class RecentGalleryDto(
    val id: Long,
    val title: String,
    val category: GalleryCategory,
    val categoryDisplayName: String,
    val coverImageUrl: String?,
    val mediaCount: Int,
    val createdAt: LocalDateTime
)