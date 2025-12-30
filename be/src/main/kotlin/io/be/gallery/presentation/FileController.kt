package io.be.gallery.presentation

import org.springframework.beans.factory.annotation.Value
import org.springframework.core.io.Resource
import org.springframework.core.io.UrlResource
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.nio.file.Path
import java.nio.file.Paths

/**
 * 파일 서빙 Controller
 * 업로드된 갤러리 미디어 파일을 서빙
 */
@RestController
@RequestMapping("/files")
class FileController(
    @Value("\${app.upload.dir:uploads}")
    private val uploadDir: String
) {
    
    private val uploadPath: Path = Paths.get(uploadDir).toAbsolutePath().normalize()
    
    /**
     * 파일 다운로드/조회
     * URL 예: /files/gallery/team1/2024/12/20241229_123456_gallery_1.jpg
     */
    @GetMapping("/gallery/**")
    fun downloadFile(@RequestParam("*") filePath: String): ResponseEntity<Resource> {
        return try {
            // 경로에서 "gallery/" 부분 제거
            val cleanPath = filePath.removePrefix("/gallery/")
            val file = uploadPath.resolve("gallery").resolve(cleanPath).normalize()
            
            // 보안: 업로드 디렉토리 밖의 파일 접근 방지
            if (!file.startsWith(uploadPath)) {
                return ResponseEntity.notFound().build()
            }
            
            val resource: Resource = UrlResource(file.toUri())
            
            if (resource.exists() && resource.isReadable) {
                // 파일 확장자에 따른 Content-Type 설정
                val contentType = determineContentType(file.toString())
                
                ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"${resource.filename}\"")
                    .body(resource)
            } else {
                ResponseEntity.notFound().build()
            }
        } catch (ex: Exception) {
            ResponseEntity.internalServerError().build()
        }
    }
    
    /**
     * 이미지 썸네일 조회 (향후 구현)
     */
    @GetMapping("/gallery/thumbnails/**")
    fun downloadThumbnail(@RequestParam("*") filePath: String): ResponseEntity<Resource> {
        // TODO: 썸네일 생성 및 서빙 로직 구현
        return ResponseEntity.notFound().build()
    }
    
    /**
     * 파일 정보 조회 (메타데이터)
     */
    @GetMapping("/gallery/info/**")
    fun getFileInfo(@RequestParam("*") filePath: String): ResponseEntity<Map<String, Any>> {
        return try {
            val cleanPath = filePath.removePrefix("/gallery/info/")
            val file = uploadPath.resolve("gallery").resolve(cleanPath).normalize()
            
            if (!file.startsWith(uploadPath) || !file.toFile().exists()) {
                return ResponseEntity.notFound().build()
            }
            
            val fileInfo = mapOf(
                "filename" to file.fileName.toString(),
                "size" to file.toFile().length(),
                "contentType" to determineContentType(file.toString()),
                "lastModified" to file.toFile().lastModified()
            )
            
            ResponseEntity.ok(fileInfo)
        } catch (ex: Exception) {
            ResponseEntity.internalServerError().build()
        }
    }
    
    // === Helper Methods ===
    
    private fun determineContentType(filePath: String): String {
        val extension = filePath.substringAfterLast(".", "").lowercase()
        
        return when (extension) {
            "jpg", "jpeg" -> "image/jpeg"
            "png" -> "image/png"
            "gif" -> "image/gif"
            "webp" -> "image/webp"
            "mp4" -> "video/mp4"
            "avi" -> "video/avi"
            "mov" -> "video/quicktime"
            "wmv" -> "video/x-ms-wmv"
            "webm" -> "video/webm"
            else -> "application/octet-stream"
        }
    }
}