package io.be.gallery.dto

import io.be.gallery.domain.*
import org.springframework.stereotype.Component
import java.text.DecimalFormat
import kotlin.math.log10
import kotlin.math.pow

/**
 * Gallery Entity <-> DTO 변환 매퍼
 */
@Component
class GalleryMapper {
    
    /**
     * Gallery Entity를 GalleryDto로 변환
     */
    fun toDto(gallery: Gallery, mediaFiles: List<GalleryMedia>, tags: List<GalleryTag>): GalleryDto {
        val coverImage = mediaFiles.find { it.isCover }?.fileUrl
        
        return GalleryDto(
            id = gallery.id,
            title = gallery.title,
            description = gallery.description,
            category = gallery.category,
            categoryDisplayName = gallery.category.displayName,
            coverImageUrl = coverImage,
            mediaCount = mediaFiles.size,
            imageCount = mediaFiles.count { it.mediaType == MediaType.IMAGE },
            videoCount = mediaFiles.count { it.mediaType == MediaType.VIDEO },
            viewCount = gallery.viewCount,
            isFeatured = gallery.isFeatured,
            createdBy = gallery.createdBy,
            createdAt = gallery.createdAt,
            tags = tags.map { it.tagName }.sorted()
        )
    }
    
    /**
     * Gallery Entity를 GalleryDetailDto로 변환
     */
    fun toDetailDto(gallery: Gallery, mediaFiles: List<GalleryMedia>, tags: List<GalleryTag>, highlightMetadata: HighlightMetadata?): GalleryDetailDto {
        return GalleryDetailDto(
            id = gallery.id,
            title = gallery.title,
            description = gallery.description,
            category = gallery.category,
            categoryDisplayName = gallery.category.displayName,
            viewCount = gallery.viewCount,
            isFeatured = gallery.isFeatured,
            createdBy = gallery.createdBy,
            createdAt = gallery.createdAt,
            updatedAt = gallery.updatedAt,
            mediaFiles = mediaFiles.sortedBy { it.sortOrder }.map { toMediaDto(it) },
            tags = tags.map { it.tagName }.sorted(),
            highlightMetadata = highlightMetadata?.let { toHighlightMetadataDto(it) }
        )
    }
    
    /**
     * GalleryMedia Entity를 GalleryMediaDto로 변환
     */
    fun toMediaDto(media: GalleryMedia): GalleryMediaDto {
        return GalleryMediaDto(
            id = media.id,
            fileName = media.fileName,
            originalFileName = media.originalFileName,
            fileUrl = media.fileUrl,
            thumbnailUrl = media.thumbnailUrl,
            fileSize = media.fileSize,
            fileSizeFormatted = formatFileSize(media.fileSize),
            mediaType = media.mediaType,
            width = media.width,
            height = media.height,
            duration = media.duration,
            durationFormatted = media.duration?.let { formatDuration(it) },
            isCover = media.isCover,
            sortOrder = media.sortOrder,
            uploadedAt = media.uploadedAt
        )
    }
    
    /**
     * HighlightMetadata Entity를 HighlightMetadataDto로 변환
     */
    fun toHighlightMetadataDto(metadata: HighlightMetadata): HighlightMetadataDto {
        return HighlightMetadataDto(
            id = metadata.id,
            matchId = metadata.matchId,
            playType = metadata.playType,
            playTypeDisplayName = metadata.playType.displayName,
            playerNames = metadata.playerNames,
            gameMinute = metadata.gameMinute,
            gameMinuteFormatted = metadata.gameMinute?.let { formatGameMinute(it) },
            description = metadata.description,
            highlightRating = metadata.highlightRating
        )
    }
    
    /**
     * Gallery Entity를 PopularGalleryDto로 변환
     */
    fun toPopularDto(gallery: Gallery, mediaFiles: List<GalleryMedia>): PopularGalleryDto {
        val coverImage = mediaFiles.find { it.isCover }?.fileUrl
        
        return PopularGalleryDto(
            id = gallery.id,
            title = gallery.title,
            category = gallery.category,
            categoryDisplayName = gallery.category.displayName,
            coverImageUrl = coverImage,
            viewCount = gallery.viewCount,
            createdAt = gallery.createdAt
        )
    }
    
    /**
     * Gallery Entity를 RecentGalleryDto로 변환
     */
    fun toRecentDto(gallery: Gallery, mediaFiles: List<GalleryMedia>): RecentGalleryDto {
        val coverImage = mediaFiles.find { it.isCover }?.fileUrl
        
        return RecentGalleryDto(
            id = gallery.id,
            title = gallery.title,
            category = gallery.category,
            categoryDisplayName = gallery.category.displayName,
            coverImageUrl = coverImage,
            mediaCount = mediaFiles.size,
            createdAt = gallery.createdAt
        )
    }
    
    /**
     * 갤러리 카테고리를 CategoryDto로 변환
     */
    fun toCategoryDto(category: GalleryCategory): CategoryDto {
        return CategoryDto(
            code = category.code,
            displayName = category.displayName,
            description = category.description
        )
    }
    
    /**
     * 갤러리 통계를 GalleryStatisticsDto로 변환
     */
    fun toStatisticsDto(
        statistics: GalleryStatistics,
        totalImageCount: Long,
        totalVideoCount: Long,
        popularTags: List<Pair<String, Long>>
    ): GalleryStatisticsDto {
        val totalCount = statistics.totalGalleryCount.toDouble()
        
        val categoryStats = GalleryCategory.values().map { category ->
            val count = statistics.categoryStats[category] ?: 0L
            CategoryStatDto(
                category = category,
                displayName = category.displayName,
                count = count,
                percentage = if (totalCount > 0) (count / totalCount * 100) else 0.0
            )
        }.filter { it.count > 0 }
        
        val totalTagCount = popularTags.sumOf { it.second }.toDouble()
        val tagStats = popularTags.map { (tagName, count) ->
            TagStatDto(
                tagName = tagName,
                count = count,
                percentage = if (totalTagCount > 0) (count / totalTagCount * 100) else 0.0
            )
        }
        
        return GalleryStatisticsDto(
            totalGalleryCount = statistics.totalGalleryCount,
            totalImageCount = totalImageCount,
            totalVideoCount = totalVideoCount,
            totalViewCount = statistics.totalViewCount,
            totalStorageUsed = formatFileSize(statistics.totalMediaCount),
            thisMonthGalleryCount = statistics.thisMonthGalleryCount,
            categoryStats = categoryStats,
            popularTags = tagStats
        )
    }
    
    /**
     * 파일 크기를 읽기 쉬운 형태로 포맷
     */
    private fun formatFileSize(bytes: Long): String {
        if (bytes == 0L) return "0 B"
        
        val units = arrayOf("B", "KB", "MB", "GB", "TB")
        val digitGroups = (log10(bytes.toDouble()) / log10(1024.0)).toInt()
        
        val formatter = DecimalFormat("#,##0.#")
        val size = bytes / 1024.0.pow(digitGroups.toDouble())
        
        return "${formatter.format(size)} ${units[digitGroups]}"
    }
    
    /**
     * 비디오 재생시간을 읽기 쉬운 형태로 포맷 (초 -> "MM:SS")
     */
    private fun formatDuration(seconds: Int): String {
        val minutes = seconds / 60
        val remainingSeconds = seconds % 60
        return String.format("%02d:%02d", minutes, remainingSeconds)
    }
    
    /**
     * 경기 시간을 읽기 쉬운 형태로 포맷
     */
    private fun formatGameMinute(minute: Int): String {
        return when {
            minute <= 45 -> "${minute}'"
            minute <= 90 -> "${minute}'"
            minute <= 105 -> "${minute}'" // 연장전
            else -> "${minute}'"
        }
    }
}