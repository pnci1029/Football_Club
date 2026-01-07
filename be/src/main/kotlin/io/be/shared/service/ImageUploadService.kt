package io.be.shared.service

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.io.IOException
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.nio.file.StandardCopyOption
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.*

@Service
class ImageUploadService(
    @Value("\${app.image.upload-path:/opt/football-club/images}")
    private val uploadDir: String,

    @Value("\${app.image.base-url:https://image.football-club.kr}")
    private val baseUrl: String
) {

    private val uploadPath: Path = Paths.get(uploadDir).toAbsolutePath().normalize()

    init {
        createBaseDirectories()
    }

    /**
     * 이미지 파일 업로드
     */
    fun upload(
        file: MultipartFile,
        uploadType: ImageUploadType,
        context: UploadContext
    ): UploadedImageInfo {
        validateFile(file)

        val relativePath = buildPath(uploadType, context)
        val targetPath = uploadPath.resolve(relativePath)

        val targetDir = targetPath.toFile()
        if (!targetDir.exists()) {
            targetDir.mkdirs()
        }

        val fileName = generateFileName(file, uploadType, context)
        val filePath = targetPath.resolve(fileName)
        val relativeFilePath = "$relativePath/$fileName"

        try {
            Files.copy(file.inputStream, filePath, StandardCopyOption.REPLACE_EXISTING)

            val thumbnailUrl = if (uploadType.supportsThumbnail && isVideoFile(file.contentType)) {
                generateVideoThumbnail(filePath, targetPath, fileName)
            } else null

            return UploadedImageInfo(
                fileName = fileName,
                originalFileName = file.originalFilename ?: "unknown",
                filePath = relativeFilePath,
                fileUrl = "$baseUrl/images/$relativeFilePath",
                thumbnailUrl = thumbnailUrl,
                fileSize = file.size,
                contentType = file.contentType ?: "application/octet-stream",
                uploadType = uploadType
            )

        } catch (ex: IOException) {
            throw RuntimeException("파일 저장에 실패했습니다: ${file.originalFilename}", ex)
        }
    }

    /**
     * 파일 삭제
     */
    fun delete(filePath: String): Boolean {
        return try {
            val fullPath = uploadPath.resolve(filePath)
            Files.deleteIfExists(fullPath)
        } catch (ex: IOException) {
            false
        }
    }

    /**
     * 팀별 저장 공간 사용량 조회
     */
    fun getStorageUsage(teamSubdomain: String, uploadType: ImageUploadType? = null): Long {
        val basePath = if (uploadType != null) {
            uploadPath.resolve(uploadType.basePath).resolve(teamSubdomain)
        } else {
            uploadPath.resolve(teamSubdomain)
        }

        return if (Files.exists(basePath)) {
            Files.walk(basePath)
                .filter { Files.isRegularFile(it) }
                .mapToLong { file ->
                    try {
                        Files.size(file)
                    } catch (ex: IOException) {
                        0L
                    }
                }
                .sum()
        } else {
            0L
        }
    }

    /**
     * 파일 존재 여부 확인
     */
    fun fileExists(filePath: String): Boolean {
        return Files.exists(uploadPath.resolve(filePath))
    }

    // === Private Methods ===

    private fun createBaseDirectories() {
        try {
            val uploadDir = uploadPath.toFile()
            if (!uploadDir.exists()) {
                uploadDir.mkdirs()
            }
            ImageUploadType.values().forEach { type ->
                val typeDir = uploadPath.resolve(type.basePath).toFile()
                if (!typeDir.exists()) {
                    typeDir.mkdirs()
                }
            }
        } catch (ex: Exception) {
            throw RuntimeException("업로드 디렉토리 생성에 실패했습니다.", ex)
        }
    }

    private fun buildPath(uploadType: ImageUploadType, context: UploadContext): String {
        val basePath = "${uploadType.basePath}/${context.teamSubdomain}"

        return when (uploadType.pathStrategy) {
            PathStrategy.YEAR_MONTH -> {
                val now = LocalDateTime.now()
                val year = now.year.toString()
                val month = String.format("%02d", now.monthValue)
                "$basePath/$year/$month"
            }
            PathStrategy.FLAT -> basePath
            PathStrategy.CUSTOM -> {
                if (context.additionalPath != null) {
                    "$basePath/${context.additionalPath}"
                } else {
                    basePath
                }
            }
        }
    }

    private fun generateFileName(
        file: MultipartFile,
        uploadType: ImageUploadType,
        context: UploadContext
    ): String {
        val timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"))
        val randomString = UUID.randomUUID().toString().substring(0, 8)
        val originalFilename = file.originalFilename ?: "unknown"
        val fileExtension = getFileExtension(originalFilename)

        val prefix = when (uploadType) {
            ImageUploadType.GALLERY -> "gallery_${context.resourceId}"
            ImageUploadType.HERO_SLIDES -> "hero"
            ImageUploadType.PROFILE -> "profile_${context.resourceId}"
            ImageUploadType.COMMUNITY -> "community_${context.resourceId}"
        }

        return "${timestamp}_${randomString}_${prefix}$fileExtension"
    }

    private fun validateFile(file: MultipartFile) {
        if (file.isEmpty) {
            throw IllegalArgumentException("빈 파일은 업로드할 수 없습니다.")
        }

        if (file.size > 50 * 1024 * 1024) { // 50MB 제한
            throw IllegalArgumentException("파일 크기는 50MB를 초과할 수 없습니다.")
        }

        val allowedTypes = setOf(
            "image/jpeg", "image/png", "image/gif", "image/webp",
            "video/mp4", "video/avi", "video/mov", "video/wmv", "video/webm"
        )

        if (!allowedTypes.contains(file.contentType)) {
            throw IllegalArgumentException("지원하지 않는 파일 형식입니다: ${file.contentType}")
        }
    }

    private fun getFileExtension(filename: String): String {
        return if (filename.contains(".")) {
            "." + filename.substringAfterLast(".")
        } else {
            ""
        }
    }

    private fun isVideoFile(contentType: String?): Boolean {
        return contentType?.startsWith("video/") == true
    }

    private fun generateVideoThumbnail(videoPath: Path, targetDir: Path, originalFileName: String): String? {
        // TODO: FFmpeg를 사용한 비디오 썸네일 생성 구현
        return null
    }
}

/**
 * 이미지 업로드 타입
 */
enum class ImageUploadType(
    val basePath: String,
    val pathStrategy: PathStrategy,
    val supportsThumbnail: Boolean = false
) {
    GALLERY("gallery", PathStrategy.YEAR_MONTH, true),
    HERO_SLIDES("hero-slides", PathStrategy.FLAT),
    PROFILE("profile", PathStrategy.FLAT),
    COMMUNITY("community", PathStrategy.YEAR_MONTH)
}

/**
 * 경로 생성 전략
 */
enum class PathStrategy {
    YEAR_MONTH,    // /{year}/{month}/
    FLAT,          // 단일 디렉토리
    CUSTOM         // 커스텀 경로
}

/**
 * 업로드 컨텍스트
 */
data class UploadContext(
    val teamSubdomain: String,
    val resourceId: Long? = null,
    val additionalPath: String? = null
)

/**
 * 업로드된 이미지 정보
 */
data class UploadedImageInfo(
    val fileName: String,
    val originalFileName: String,
    val filePath: String,
    val fileUrl: String,
    val thumbnailUrl: String? = null,
    val fileSize: Long,
    val contentType: String,
    val uploadType: ImageUploadType
)
