package io.be.gallery.application

import io.be.gallery.domain.*
import io.be.gallery.dto.*
import io.be.shared.security.TenantContextHolder
import jakarta.persistence.EntityManager
import jakarta.persistence.EntityNotFoundException
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.security.access.AccessDeniedException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile
import java.time.LocalDate

@Service
@Transactional(readOnly = true)
class GalleryService(
    private val galleryRepository: GalleryRepository,
    private val galleryMediaRepository: GalleryMediaRepository,
    private val galleryTagRepository: GalleryTagRepository,
    private val highlightMetadataRepository: HighlightMetadataRepository,
    private val fileStorageService: FileStorageService,
    private val galleryMapper: GalleryMapper,
    private val entityManager: EntityManager
) {

    /**
     * 갤러리 목록 조회 (페이징, 필터링 지원)
     */
    fun getGalleries(searchRequest: GallerySearchRequest): Page<GalleryDto> {
        val teamSubdomain = getCurrentTeamSubdomain()
        val pageable = createPageable(searchRequest)

        val galleries = when {
            searchRequest.keyword.isNullOrBlank() &&
            searchRequest.tags.isNullOrEmpty() &&
            searchRequest.startDate.isNullOrBlank() &&
            searchRequest.endDate.isNullOrBlank() -> {
                // 단순 카테고리 필터링
                if (searchRequest.category == null) {
                    galleryRepository.findByTeamSubdomainAndIsActiveTrueOrderByCreatedAtDesc(teamSubdomain, pageable)
                } else {
                    galleryRepository.findByTeamSubdomainAndCategoryAndIsActiveTrueOrderByCreatedAtDesc(
                        teamSubdomain, searchRequest.category, pageable
                    )
                }
            }
            else -> {
                // 복합 검색
                galleryRepository.searchGalleries(
                    teamSubdomain = teamSubdomain,
                    keyword = searchRequest.keyword,
                    category = searchRequest.category,
                    tags = searchRequest.tags,
                    startDate = searchRequest.startDate?.let { LocalDate.parse(it) },
                    endDate = searchRequest.endDate?.let { LocalDate.parse(it) },
                    pageable = pageable
                )
            }
        }

        return galleries.map { gallery ->
            val mediaFiles = galleryMediaRepository.findByGalleryIdOrderBySortOrder(gallery.id)
            val tags = galleryTagRepository.findByGalleryIdOrderByTagName(gallery.id)
            galleryMapper.toDto(gallery, mediaFiles, tags)
        }
    }

    /**
     * 갤러리 상세 조회
     */
    fun getGalleryDetail(galleryId: Long): GalleryDetailDto {
        val teamSubdomain = getCurrentTeamSubdomain()
        val gallery = findGalleryById(galleryId)

        // 권한 확인
        validateGalleryAccess(gallery, teamSubdomain)

        // 조회수 증가
        incrementViewCount(galleryId)

        // 미디어 파일과 태그 조회
        val mediaFiles = galleryMediaRepository.findByGalleryIdOrderBySortOrder(galleryId)
        val tags = galleryTagRepository.findByGalleryIdOrderByTagName(galleryId)

        // 하이라이트 메타데이터 조회
        val highlightMetadata = if (gallery.category == GalleryCategory.HIGHLIGHT) {
            highlightMetadataRepository.findByGalleryId(galleryId)
        } else null

        return galleryMapper.toDetailDto(gallery, mediaFiles, tags, highlightMetadata)
    }

    /**
     * 추천 갤러리 목록 조회
     */
    fun getFeaturedGalleries(): List<GalleryDto> {
        val teamSubdomain = getCurrentTeamSubdomain()
        return galleryRepository.findByTeamSubdomainAndIsFeaturedTrueAndIsActiveTrueOrderByCreatedAtDesc(teamSubdomain)
            .map { gallery ->
                val mediaFiles = galleryMediaRepository.findByGalleryIdOrderBySortOrder(gallery.id)
                val tags = galleryTagRepository.findByGalleryIdOrderByTagName(gallery.id)
                galleryMapper.toDto(gallery, mediaFiles, tags)
            }
    }

    /**
     * 인기 갤러리 조회
     */
    fun getPopularGalleries(limit: Int = 10): List<PopularGalleryDto> {
        val teamSubdomain = getCurrentTeamSubdomain()
        return galleryRepository.findPopularGalleries(teamSubdomain, limit)
            .map { gallery ->
                val mediaFiles = galleryMediaRepository.findByGalleryIdOrderBySortOrder(gallery.id)
                galleryMapper.toPopularDto(gallery, mediaFiles)
            }
    }

    /**
     * 최근 갤러리 조회 (홈 대시보드용)
     */
    fun getRecentGalleries(limit: Int = 6): List<RecentGalleryDto> {
        val teamSubdomain = getCurrentTeamSubdomain()
        val pageable = PageRequest.of(0, limit)
        return galleryRepository.findRecentGalleries(teamSubdomain, pageable)
            .map { gallery ->
                val mediaFiles = galleryMediaRepository.findByGalleryIdOrderBySortOrder(gallery.id)
                galleryMapper.toRecentDto(gallery, mediaFiles)
            }
    }

    /**
     * 하이라이트 갤러리 조회
     */
    fun getHighlightGalleries(
        playType: PlayType? = null,
        minRating: Int = 0,
        page: Int = 0,
        size: Int = 12
    ): Page<GalleryDto> {
        val teamSubdomain = getCurrentTeamSubdomain()
        val pageable = PageRequest.of(page, size)

        return galleryRepository.findHighlightGalleries(teamSubdomain, playType, pageable)
            .map { gallery ->
                val mediaFiles = galleryMediaRepository.findByGalleryIdOrderBySortOrder(gallery.id)
                val tags = galleryTagRepository.findByGalleryIdOrderByTagName(gallery.id)
                galleryMapper.toDto(gallery, mediaFiles, tags)
            }
    }

    /**
     * 갤러리 카테고리 목록 조회
     */
    fun getCategories(): List<CategoryDto> {
        return GalleryCategory.values().map { galleryMapper.toCategoryDto(it) }
    }

    /**
     * 팀별 태그 목록 조회
     */
    fun getTagsByTeam(): List<String> {
        val teamSubdomain = getCurrentTeamSubdomain()
        // 팀의 모든 갤러리 ID를 먼저 조회
        val galleryIds = galleryRepository.findByTeamSubdomainAndIsActiveTrueOrderByCreatedAtDesc(
            teamSubdomain,
            Pageable.unpaged()
        ).content.map { it.id }
        if (galleryIds.isEmpty()) return emptyList()

        return galleryTagRepository.findByGalleryIdInOrderByTagName(galleryIds).map { it.tagName }.distinct().sorted()
    }

    /**
     * 인기 태그 조회
     */
    fun getPopularTags(limit: Int = 20): List<TagStatDto> {
        val teamSubdomain = getCurrentTeamSubdomain()
        // 팀의 모든 갤러리 ID를 먼저 조회
        val galleryIds = galleryRepository.findByTeamSubdomainAndIsActiveTrueOrderByCreatedAtDesc(
            teamSubdomain,
            Pageable.unpaged()
        ).content.map { it.id }
        if (galleryIds.isEmpty()) return emptyList()

        // 태그별 카운트
        val tagCounts = galleryTagRepository.findByGalleryIdIn(galleryIds)
            .groupBy { it.tagName }
            .mapValues { it.value.size.toLong() }
            .toList()
            .sortedByDescending { it.second }
            .take(limit)

        val totalCount = tagCounts.sumOf { it.second }.toDouble()

        return tagCounts.map { (tagName, count) ->
            TagStatDto(
                tagName = tagName,
                count = count,
                percentage = if (totalCount > 0) (count.toDouble() / totalCount * 100) else 0.0
            )
        }
    }

    /**
     * 갤러리 통계 조회
     */
    fun getGalleryStatistics(): GalleryStatisticsDto {
        val teamSubdomain = getCurrentTeamSubdomain()
        val statistics = galleryRepository.getGalleryStatistics(teamSubdomain)

        // 이미지/비디오 개수 별도 조회
        val totalImageCount = galleryMediaRepository.countByGalleryIdAndMediaType(0L, MediaType.IMAGE) // TODO: 팀별 조회로 수정 필요
        val totalVideoCount = galleryMediaRepository.countByGalleryIdAndMediaType(0L, MediaType.VIDEO) // TODO: 팀별 조회로 수정 필요

        // 인기 태그
        val popularTags = getPopularTags(10).map { it.tagName to it.count }

        return galleryMapper.toStatisticsDto(statistics, totalImageCount, totalVideoCount, popularTags)
    }

    /**
     * 갤러리 생성
     */
    @Transactional
    fun createGallery(request: CreateGalleryRequest, files: List<MultipartFile>): GalleryDto {
        val teamSubdomain = getCurrentTeamSubdomain()

        // 파일 업로드 검증
        validateFileUploads(files)

        // 갤러리 생성
        val gallery = Gallery(
            teamId = request.teamId,
            teamSubdomain = teamSubdomain,
            title = request.title,
            description = request.description,
            category = request.category,
            createdBy = request.createdBy,
            isFeatured = request.isFeatured
        )

        val savedGallery = galleryRepository.save(gallery)

        // 파일 업로드 및 미디어 엔티티 생성
        if (files.isNotEmpty()) {
            uploadMediaFiles(savedGallery, files, request.createdBy)
        }

        // 태그 생성
        request.tags?.let { tags ->
            createGalleryTags(savedGallery, tags)
        }

        // 하이라이트 메타데이터 생성
        if (request.category == GalleryCategory.HIGHLIGHT && request.highlightMetadata != null) {
            createHighlightMetadata(savedGallery, request.highlightMetadata)
        }

        val finalGallery = galleryRepository.findById(savedGallery.id).orElseThrow()
        val mediaFiles = galleryMediaRepository.findByGalleryIdOrderBySortOrder(finalGallery.id)
        val tags = galleryTagRepository.findByGalleryIdOrderByTagName(finalGallery.id)
        return galleryMapper.toDto(finalGallery, mediaFiles, tags)
    }

    /**
     * 갤러리 수정
     */
    @Transactional
    fun updateGallery(galleryId: Long, request: UpdateGalleryRequest): GalleryDto {
        val teamSubdomain = getCurrentTeamSubdomain()
        val gallery = findGalleryById(galleryId)

        // 권한 확인
        validateGalleryAccess(gallery, teamSubdomain)

        // 갤러리 정보 업데이트
        val updatedGallery = gallery.copy(
            title = request.title,
            description = request.description,
            category = request.category,
            isFeatured = request.isFeatured
        )

        galleryRepository.save(updatedGallery)

        // 태그 업데이트
        updateGalleryTags(galleryId, request.tags ?: emptyList())

        // 하이라이트 메타데이터 업데이트
        updateHighlightMetadata(galleryId, request.highlightMetadata)

        val finalGallery = galleryRepository.findById(galleryId).orElseThrow()
        val mediaFiles = galleryMediaRepository.findByGalleryIdOrderBySortOrder(finalGallery.id)
        val tags = galleryTagRepository.findByGalleryIdOrderByTagName(finalGallery.id)
        return galleryMapper.toDto(finalGallery, mediaFiles, tags)
    }

    /**
     * 갤러리 삭제 (비활성화)
     */
    @Transactional
    fun deleteGallery(galleryId: Long) {
        val teamSubdomain = getCurrentTeamSubdomain()
        val gallery = findGalleryById(galleryId)

        // 권한 확인
        validateGalleryAccess(gallery, teamSubdomain)

        // 갤러리 비활성화
        val deactivatedGallery = gallery.copy(isActive = false)
        galleryRepository.save(deactivatedGallery)
    }

    /**
     * 갤러리에 미디어 파일 추가
     */
    @Transactional
    fun addMediaToGallery(galleryId: Long, files: List<MultipartFile>): List<GalleryMediaDto> {
        // 외래키 검증 없이 바로 진행

        // 파일 업로드 검증
        validateFileUploads(files)

        // 현재 최대 순서 조회
        val currentMaxOrder = galleryMediaRepository.findByGalleryIdOrderBySortOrder(galleryId).maxOfOrNull { it.sortOrder } ?: -1

        val uploadedMedia = mutableListOf<GalleryMedia>()

        files.forEachIndexed { index, file ->
            try {
                val mediaFile = fileStorageService.uploadGalleryMedia(file, galleryId, "default")

                val galleryMedia = GalleryMedia(
                    galleryId = galleryId,
                    fileName = mediaFile.fileName,
                    originalFileName = file.originalFilename ?: "",
                    filePath = mediaFile.filePath,
                    fileUrl = mediaFile.fileUrl,
                    fileSize = file.size,
                    mimeType = file.contentType ?: "",
                    mediaType = determineMediaType(file.contentType),
                    sortOrder = currentMaxOrder + index + 1,
                    isCover = index == 0, // 첫 번째 업로드를 커버로
                    uploadedBy = "ADMIN" // TODO: 실제 사용자 정보로 변경
                )
                uploadedMedia.add(galleryMediaRepository.save(galleryMedia))
            } catch (e: Exception) {
                throw IllegalStateException("미디어 파일 업로드 실패: ${e.message}", e)
            }
        }

        return uploadedMedia.map { galleryMapper.toMediaDto(it) }
    }

    /**
     * 미디어 파일 삭제
     */
    @Transactional
    fun deleteMedia(mediaId: Long) {
        val teamSubdomain = getCurrentTeamSubdomain()
        val media = galleryMediaRepository.findById(mediaId)
            .orElseThrow { EntityNotFoundException("미디어 파일을 찾을 수 없습니다.") }

        // 권한 확인 - 갤러리 조회 후 검증
        val gallery = galleryRepository.findById(media.galleryId)
            .orElseThrow { EntityNotFoundException("갤러리를 찾을 수 없습니다.") }
        validateGalleryAccess(gallery, teamSubdomain)

        // 파일 시스템에서 삭제
        fileStorageService.deleteFile(media.filePath)

        // 커버 이미지였다면 다른 이미지를 커버로 설정
        if (media.isCover) {
            val nextCoverMedia = galleryMediaRepository
                .findByGalleryIdAndMediaTypeOrderBySortOrder(media.galleryId, MediaType.IMAGE)
                .firstOrNull { it.id != mediaId }

            nextCoverMedia?.let {
                val updatedMedia = it.copy(isCover = true)
                galleryMediaRepository.save(updatedMedia)
            }
        }

        // 미디어 삭제
        galleryMediaRepository.delete(media)
    }

    // === Private Helper Methods ===

    private fun getCurrentTeamSubdomain(): String {
        return TenantContextHolder.getContextOrNull()?.subdomain
            ?: throw IllegalStateException("팀 정보를 찾을 수 없습니다.")
    }

    private fun findGalleryById(galleryId: Long): Gallery {
        return galleryRepository.findById(galleryId)
            .orElseThrow { EntityNotFoundException("갤러리를 찾을 수 없습니다.") }
    }

    private fun validateGalleryAccess(gallery: Gallery, teamSubdomain: String) {
        if (gallery.teamSubdomain != teamSubdomain || !gallery.isActive) {
            throw AccessDeniedException("접근 권한이 없습니다.")
        }
    }

    private fun createPageable(searchRequest: GallerySearchRequest): Pageable {
        val sort = when (searchRequest.sortBy) {
            "views" -> Sort.by(if (searchRequest.sortDirection == "asc") Sort.Direction.ASC else Sort.Direction.DESC, "viewCount")
            "rating" -> Sort.by(if (searchRequest.sortDirection == "asc") Sort.Direction.ASC else Sort.Direction.DESC, "highlightRating")
            else -> Sort.by(if (searchRequest.sortDirection == "asc") Sort.Direction.ASC else Sort.Direction.DESC, "createdAt")
        }

        return PageRequest.of(searchRequest.page, searchRequest.size, sort)
    }

    @Transactional
    fun incrementViewCount(galleryId: Long) {
        galleryRepository.incrementViewCount(galleryId)
    }

    private fun validateFileUploads(files: List<MultipartFile>) {
        files.forEach { file ->
            // 파일 크기 검증 (50MB 제한)
            if (file.size > 50 * 1024 * 1024) {
                throw IllegalArgumentException("파일 크기는 50MB를 초과할 수 없습니다: ${file.originalFilename}")
            }

            // 파일 타입 검증
            val contentType = file.contentType ?: ""
            val allowedImageTypes = setOf("image/jpeg", "image/png", "image/gif", "image/webp")
            val allowedVideoTypes = setOf("video/mp4", "video/avi", "video/mov", "video/wmv", "video/webm")

            if (!allowedImageTypes.contains(contentType) && !allowedVideoTypes.contains(contentType)) {
                throw IllegalArgumentException("지원하지 않는 파일 형식입니다: ${file.originalFilename}")
            }
        }
    }

    private fun determineMediaType(contentType: String?): MediaType {
        return when {
            contentType?.startsWith("image/") == true -> MediaType.IMAGE
            contentType?.startsWith("video/") == true -> MediaType.VIDEO
            else -> MediaType.IMAGE // 기본값
        }
    }

    private fun uploadMediaFiles(gallery: Gallery, files: List<MultipartFile>, uploadedBy: String?) {
        files.forEachIndexed { index, file ->
            val mediaFile = fileStorageService.uploadGalleryMedia(file, gallery.id, gallery.teamSubdomain)
            val galleryMedia = GalleryMedia(
                galleryId = gallery.id,
                fileName = mediaFile.fileName,
                originalFileName = file.originalFilename ?: "",
                filePath = mediaFile.filePath,
                fileUrl = mediaFile.fileUrl,
                fileSize = file.size,
                mimeType = file.contentType ?: "",
                mediaType = determineMediaType(file.contentType),
                sortOrder = index,
                isCover = index == 0, // 첫 번째 파일을 커버로 설정
                uploadedBy = uploadedBy
            )
            galleryMediaRepository.save(galleryMedia)
        }
    }

    private fun createGalleryTags(gallery: Gallery, tagNames: List<String>) {
        tagNames.forEach { tagName ->
            if (tagName.isNotBlank()) {
                val tag = GalleryTag(
                    galleryId = gallery.id,
                    tagName = tagName.trim()
                )
                galleryTagRepository.save(tag)
            }
        }
    }

    private fun updateGalleryTags(galleryId: Long, newTagNames: List<String>) {
        // 기존 태그 삭제
        galleryTagRepository.deleteByGalleryId(galleryId)

        // 새 태그 생성
        val gallery = findGalleryById(galleryId)
        createGalleryTags(gallery, newTagNames)
    }

    private fun createHighlightMetadata(gallery: Gallery, request: CreateHighlightMetadataRequest) {
        val metadata = HighlightMetadata(
            galleryId = gallery.id,
            matchId = request.matchId,
            playType = request.playType,
            playerNames = request.playerNames,
            gameMinute = request.gameMinute,
            description = request.description,
            highlightRating = request.highlightRating
        )
        highlightMetadataRepository.save(metadata)
    }

    private fun updateHighlightMetadata(galleryId: Long, request: UpdateHighlightMetadataRequest?) {
        val existingMetadata = highlightMetadataRepository.findByGalleryId(galleryId)

        if (request != null) {
            if (existingMetadata != null) {
                // 기존 메타데이터 업데이트
                val updatedMetadata = existingMetadata.copy(
                    matchId = request.matchId,
                    playType = request.playType,
                    playerNames = request.playerNames,
                    gameMinute = request.gameMinute,
                    description = request.description,
                    highlightRating = request.highlightRating
                )
                highlightMetadataRepository.save(updatedMetadata)
            } else {
                // 새 메타데이터 생성
                val gallery = findGalleryById(galleryId)
                val metadata = HighlightMetadata(
                    galleryId = gallery.id,
                    matchId = request.matchId,
                    playType = request.playType,
                    playerNames = request.playerNames,
                    gameMinute = request.gameMinute,
                    description = request.description,
                    highlightRating = request.highlightRating
                )
                highlightMetadataRepository.save(metadata)
            }
        } else if (existingMetadata != null) {
            // 메타데이터 삭제
            highlightMetadataRepository.delete(existingMetadata)
        }
    }
}
