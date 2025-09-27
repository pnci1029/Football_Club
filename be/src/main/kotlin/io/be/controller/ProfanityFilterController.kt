package io.be.controller

import io.be.service.ProfanityFilterService
import io.be.util.ApiResponse
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v1/admin/profanity")
@CrossOrigin(origins = ["*"])
class ProfanityFilterController(
    private val profanityFilterService: ProfanityFilterService
) {

    private val logger = LoggerFactory.getLogger(ProfanityFilterController::class.java)

    data class AddWordRequest(
        @field:NotBlank(message = "단어를 입력해주세요.")
        val word: String
    )

    data class RemoveWordRequest(
        @field:NotBlank(message = "단어를 입력해주세요.")
        val word: String
    )

    data class CheckTextRequest(
        @field:NotBlank(message = "검사할 텍스트를 입력해주세요.")
        val text: String
    )

    data class FilterTextResponse(
        val originalText: String,
        val filteredText: String,
        val containsProfanity: Boolean
    )

    data class ProfanityStatsResponse(
        val totalWordsCount: Long
    )

    /**
     * 비속어 단어 추가
     */
    @PostMapping("/words")
    fun addProfanityWord(
        @Valid @RequestBody request: AddWordRequest
    ): ResponseEntity<ApiResponse<String>> {
        logger.info("Adding profanity word: ${request.word}")
        
        val success = profanityFilterService.addProfanityWord(request.word)
        
        return if (success) {
            ResponseEntity.ok(ApiResponse.success("비속어 단어가 추가되었습니다."))
        } else {
            ResponseEntity.badRequest().body(ApiResponse.error("비속어 단어 추가에 실패했습니다."))
        }
    }

    /**
     * 비속어 단어 제거
     */
    @DeleteMapping("/words")
    fun removeProfanityWord(
        @Valid @RequestBody request: RemoveWordRequest
    ): ResponseEntity<ApiResponse<String>> {
        logger.info("Removing profanity word: ${request.word}")
        
        val success = profanityFilterService.removeProfanityWord(request.word)
        
        return if (success) {
            ResponseEntity.ok(ApiResponse.success("비속어 단어가 제거되었습니다."))
        } else {
            ResponseEntity.badRequest().body(ApiResponse.error("비속어 단어 제거에 실패했습니다."))
        }
    }

    /**
     * 텍스트 비속어 검사 및 필터링
     */
    @PostMapping("/check")
    fun checkAndFilterText(
        @Valid @RequestBody request: CheckTextRequest
    ): ResponseEntity<ApiResponse<FilterTextResponse>> {
        logger.info("Checking text for profanity: ${request.text.take(50)}...")
        
        val containsProfanity = profanityFilterService.containsProfanity(request.text)
        val filteredText = profanityFilterService.filterProfanity(request.text)
        
        val response = FilterTextResponse(
            originalText = request.text,
            filteredText = filteredText,
            containsProfanity = containsProfanity
        )
        
        return ResponseEntity.ok(ApiResponse.success(response))
    }

    /**
     * 비속어 필터 통계 조회
     */
    @GetMapping("/stats")
    fun getProfanityStats(): ResponseEntity<ApiResponse<ProfanityStatsResponse>> {
        val totalCount = profanityFilterService.getProfanityWordsCount()
        
        val response = ProfanityStatsResponse(
            totalWordsCount = totalCount
        )
        
        return ResponseEntity.ok(ApiResponse.success(response))
    }

    /**
     * 비속어 필터 테스트용 엔드포인트
     */
    @GetMapping("/test")
    fun test(): ResponseEntity<ApiResponse<String>> {
        return ResponseEntity.ok(ApiResponse.success("Profanity Filter API is working!"))
    }
}