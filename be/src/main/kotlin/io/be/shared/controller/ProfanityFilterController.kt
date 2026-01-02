package io.be.shared.controller

import io.be.shared.service.ProfanityFilterService
import io.be.shared.exception.BadRequestException
import io.be.shared.dto.*
import jakarta.validation.Valid
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


    /**
     * 비속어 단어 추가
     */
    @PostMapping("/words")
    fun addProfanityWord(
        @Valid @RequestBody request: AddWordRequest
    ): ResponseEntity<String> {
        logger.info("Adding profanity word: ${request.word}")
        
        val success = profanityFilterService.addProfanityWord(request.word)
        
        if (!success) {
            throw BadRequestException("비속어 단어 추가에 실패했습니다.")
        }
        return ResponseEntity.ok("비속어 단어가 추가되었습니다.")
    }

    /**
     * 비속어 단어 제거
     */
    @DeleteMapping("/words")
    fun removeProfanityWord(
        @Valid @RequestBody request: RemoveWordRequest
    ): ResponseEntity<String> {
        logger.info("Removing profanity word: ${request.word}")
        
        val success = profanityFilterService.removeProfanityWord(request.word)
        
        if (!success) {
            throw BadRequestException("비속어 단어 제거에 실패했습니다.")
        }
        return ResponseEntity.ok("비속어 단어가 제거되었습니다.")
    }

    /**
     * 텍스트 비속어 검사 및 필터링
     */
    @PostMapping("/check")
    fun checkAndFilterText(
        @Valid @RequestBody request: CheckTextRequest
    ): ResponseEntity<FilterTextResponse> {
        logger.info("Checking text for profanity: ${request.text.take(50)}...")
        
        val containsProfanity = profanityFilterService.containsProfanity(request.text)
        val filteredText = profanityFilterService.filterProfanity(request.text)
        
        val response = FilterTextResponse(
            originalText = request.text,
            filteredText = filteredText,
            containsProfanity = containsProfanity
        )
        
        return ResponseEntity.ok(response)
    }

    /**
     * 비속어 필터 통계 조회
     */
    @GetMapping("/stats")
    fun getProfanityStats(): ResponseEntity<ProfanityStatsResponse> {
        val totalCount = profanityFilterService.getProfanityWordsCount()
        
        val response = ProfanityStatsResponse(
            totalWordsCount = totalCount
        )
        
        return ResponseEntity.ok(response)
    }

    /**
     * 비속어 필터 테스트용 엔드포인트
     */
    @GetMapping("/test")
    fun test(): ResponseEntity<String> {
        return ResponseEntity.ok("Profanity Filter API is working!")
    }
}