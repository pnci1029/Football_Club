package io.be.gallery.application

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
class FileStorageService(
    @Value("\${app.image.upload-path:/opt/football-club/images}")
    private val uploadDir: String,

    @Value("\${app.image.base-url:https://image.football-club.kr}")
    private val baseUrl: String
) {

    private val uploadPath: Path = Paths.get(uploadDir).toAbsolutePath().normalize()

    init {
        // 업로드 디렉토리 생성
        createDirectories()
    }

    /**
     * 갤러리 미디어 파일 업로드
     */
    fun uploadGalleryMedia(file: MultipartFile, galleryId: Long, teamSubdomain: String): UploadedFileInfo {
        validateFile(file)

        val now = LocalDateTime.now()
        val year = now.year.toString()
        val month = String.format("%02d", now.monthValue)

        // 디렉토리 구조: gallery/{team-subdomain}/{year}/{month}/
        val relativePath = "gallery/$teamSubdomain/$year/$month"
        val targetPath = uploadPath.resolve(relativePath)

        // 디렉토리 생성
        Files.createDirectories(targetPath)

        // 파일명 생성: timestamp_random_originalname
        val timestamp = now.format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"))
        val randomString = UUID.randomUUID().toString().substring(0, 8)
        val originalFilename = file.originalFilename ?: "unknown"
        val fileExtension = getFileExtension(originalFilename)
        val fileName = "${timestamp}_${randomString}_gallery_${galleryId}$fileExtension"

        val filePath = targetPath.resolve(fileName)
        val relativeFilePath = "$relativePath/$fileName"

        try {
            // 파일 저장
            Files.copy(file.inputStream, filePath, StandardCopyOption.REPLACE_EXISTING)

            // 썸네일 생성 (비디오인 경우)
            val thumbnailUrl = if (isVideoFile(file.contentType)) {
                generateVideoThumbnail(filePath, targetPath, fileName)
            } else null

            return UploadedFileInfo(
                fileName = fileName,
                originalFileName = originalFilename,
                filePath = relativeFilePath,
                fileUrl = "$baseUrl/$relativeFilePath",
                thumbnailUrl = thumbnailUrl,
                fileSize = file.size,
                contentType = file.contentType ?: "application/octet-stream"
            )

        } catch (ex: IOException) {
            throw RuntimeException("파일 저장에 실패했습니다: ${file.originalFilename}", ex)
        }
    }

    /**
     * 파일 삭제
     */
    fun deleteFile(filePath: String): Boolean {
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
    fun getStorageUsage(teamSubdomain: String): Long {
        val teamPath = uploadPath.resolve("gallery").resolve(teamSubdomain)
        return if (Files.exists(teamPath)) {
            Files.walk(teamPath)
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

    private fun createDirectories() {
        try {
            val uploadDir = uploadPath.toFile()
            if (!uploadDir.exists()) {
                uploadDir.mkdirs()
            }
            val galleryDir = uploadPath.resolve("gallery").toFile()
            if (!galleryDir.exists()) {
                galleryDir.mkdirs()
            }
        } catch (ex: Exception) {
            throw RuntimeException("업로드 디렉토리 생성에 실패했습니다.", ex)
        }
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
        // 현재는 기본 비디오 아이콘 반환
        return null
    }
}

/**
 * 업로드된 파일 정보
 */
data class UploadedFileInfo(
    val fileName: String,
    val originalFileName: String,
    val filePath: String,
    val fileUrl: String,
    val thumbnailUrl: String?,
    val fileSize: Long,
    val contentType: String
)
