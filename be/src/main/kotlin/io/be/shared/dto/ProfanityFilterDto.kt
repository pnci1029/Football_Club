package io.be.shared.dto

import jakarta.validation.constraints.NotBlank

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

data class ValidationResult(
    val isValid: Boolean,
    val violations: List<String>
)