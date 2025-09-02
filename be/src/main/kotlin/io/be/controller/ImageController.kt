package io.be.controller

import org.springframework.beans.factory.annotation.Value
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import java.io.File
import java.nio.file.Files
import java.nio.file.Paths
import java.util.*

@RestController
@RequestMapping("/v1/images")
class ImageController {

    @Value("\${app.image.upload-path:/opt/football-club/images}")
    private lateinit var uploadPath: String

    @Value("\${app.image.base-url:https://image.football-club.kr}")
    private lateinit var baseUrl: String

    @Value("\${app.image.allowed-extensions:jpg,jpeg,png,gif,webp}")
    private lateinit var allowedExtensions: String

    @PostMapping("/upload")
    fun uploadImage(
        @RequestParam("file") file: MultipartFile
    ) {
        println("file = ${file}")
        println("6666 - ImageController 도착")
//        try {
//            // 파일 검증
//            if (file.isEmpty) {
//                return ResponseEntity.badRequest().body(mapOf("error" to "파일이 비어있습니다"))
//            }
//
//            // 확장자 검증
//            val originalFilename = file.originalFilename ?: ""
//            val extension = originalFilename.substringAfterLast(".", "").lowercase()
//            val allowedExts = allowedExtensions.split(",").map { it.trim() }
//
//            if (extension !in allowedExts) {
//                return ResponseEntity.badRequest().body(mapOf("error" to "허용되지 않은 파일 형식입니다"))
//            }
//
//            // 고유 파일명 생성
//            val uuid = UUID.randomUUID().toString()
//            val filename = "${uuid}.${extension}"
//
//            // 업로드 디렉토리 생성
//            val uploadDir = File(uploadPath)
//            if (!uploadDir.exists()) {
//                uploadDir.mkdirs()
//            }
//
//            // 파일 저장
//            val filePath = Paths.get(uploadPath, filename)
//            Files.copy(file.inputStream, filePath)
//
//            // 응답 데이터
//            val response = mapOf(
//                "success" to true,
//                "filename" to filename,
//                "originalName" to originalFilename,
//                "url" to "${baseUrl}/images/${filename}",
//                "size" to file.size
//            )
//
//            return ResponseEntity.ok(response)
//
//        } catch (e: Exception) {
//            return ResponseEntity.internalServerError().body(
//                mapOf("error" to "파일 업로드 중 오류가 발생했습니다: ${e.message}")
//            )
//        }
    }

    @DeleteMapping("/{filename}")
    fun deleteImage(@PathVariable filename: String): ResponseEntity<Map<String, Any>> {
        try {
            val filePath = Paths.get(uploadPath, filename)
            val file = filePath.toFile()

            if (!file.exists()) {
                return ResponseEntity.notFound().build()
            }

            if (file.delete()) {
                return ResponseEntity.ok(mapOf("success" to true, "message" to "파일이 삭제되었습니다"))
            } else {
                return ResponseEntity.internalServerError().body(mapOf("error" to "파일 삭제에 실패했습니다"))
            }

        } catch (e: Exception) {
            return ResponseEntity.internalServerError().body(
                mapOf("error" to "파일 삭제 중 오류가 발생했습니다: ${e.message}")
            )
        }
    }
}
