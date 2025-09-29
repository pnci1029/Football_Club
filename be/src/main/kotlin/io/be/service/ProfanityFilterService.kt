package io.be.service

import org.slf4j.LoggerFactory
import org.springframework.data.redis.core.RedisTemplate
import org.springframework.stereotype.Service
import java.util.concurrent.TimeUnit
import jakarta.annotation.PostConstruct

@Service
class ProfanityFilterService(
    private val redisTemplate: RedisTemplate<String, Any>
) {
    
    private val logger = LoggerFactory.getLogger(ProfanityFilterService::class.java)
    
    companion object {
        private const val PROFANITY_WORDS_KEY = "profanity:words"
        private const val PROFANITY_PATTERNS_KEY = "profanity:patterns"
        private const val CACHE_TTL_HOURS = 24L
    }
    
    private val defaultProfanityWords = setOf(
        // 기본 비속어 목록 (강화된 버전)
        "시발", "씨발", "시팔", "씨팔", "ㅅㅂ", "ㅆㅂ", "시1발", "씨1발", "s발", "씨8", "시8", "뭐시발", "뭐씨발",
        "개새끼", "개놈", "개년", "개자식", "개빢", "개세끼", "개쉐이", "개시끼", "갸새끼", "개새키", "ㄱㅐ새끼",
        "병신", "븅신", "ㅂㅅ", "멍청이", "바보", "벼신", "병1신", "병8신", "ㅂㅇ신",
        "좆", "좇", "존나", "ㅈㄴ", "지랄", "ㅈㄹ", "좃", "조까", "좆까", "존1나", "ㅈ같", "좆같",
        "꺼져", "닥쳐", "죽어", "뒤져", "꺼지라", "닥치라", "뒈져", "디져", "뒤1져",
        "개똥", "똥개", "쓰레기", "애미", "애비", "에미", "에비", "애1미", "어미", "아비",
        "호로", "창녀", "걸레", "썅", "새끼", "새1끼", "쌔끼", "색히", "ㅅㅐ끼",
        "미친", "또라이", "정신병", "정신나간", "미1친", "ㅁㅊ", "미쳤", "또라인",
        "한남", "한녀", "페미", "맘충", "틀딱", "급식충", "일베", "좌좀", "우좀", "종북",
        "닌겐", "쪽발이", "쪽빨이", "원숭이", "쪽팔이", "쫄보", "찌질이",
        "fuck", "shit", "bitch", "damn", "ass", "pussy", "cunt", "faggot", "nigger",
        // 특수문자로 변형된 버전들
        "씨8ㅏㄹ", "ㅅ1ㅂ", "ㅂ1ㅅ", "ㅈ1ㄴ", "ㅈ1ㄹ", "개1년", "새1끼"
    )
    
    @PostConstruct
    fun initializeProfanityWords() {
        try {
            if (!redisTemplate.hasKey(PROFANITY_WORDS_KEY)) {
                logger.info("Initializing profanity words in Redis")
                val ops = redisTemplate.opsForSet()
                defaultProfanityWords.forEach { word ->
                    ops.add(PROFANITY_WORDS_KEY, word)
                }
                redisTemplate.expire(PROFANITY_WORDS_KEY, CACHE_TTL_HOURS, TimeUnit.HOURS)
                logger.info("Added ${defaultProfanityWords.size} profanity words to Redis")
            }
        } catch (e: Exception) {
            logger.warn("Redis unavailable (${e.message}), using default profanity word list")
        }
    }
    
    fun containsProfanity(text: String): Boolean {
        if (text.isBlank()) return false
        
        try {
            // 다양한 형태로 텍스트 정리
            val normalizedTexts = listOf(
                text.lowercase(), // 원본 소문자
                text.replace(Regex("[^가-힣a-zA-Z0-9\\s]"), "").lowercase(), // 특수문자 제거
                text.replace(Regex("\\s"), "").lowercase(), // 공백 제거
                text.replace(Regex("[^가-힣a-zA-Z0-9]"), "").lowercase(), // 특수문자와 공백 모두 제거
                text.replace(Regex("[0-9]"), "").lowercase(), // 숫자 제거
                text.replace(Regex("[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?~`]"), "").lowercase() // 특수문자만 제거
            )
            
            val profanityWords = getProfanityWords()
            
            return profanityWords.any { word ->
                val normalizedWord = word.lowercase()
                normalizedTexts.any { normalizedText ->
                    normalizedText.contains(normalizedWord) ||
                    // 자음/모음 분리 검사
                    normalizedText.replace(Regex("\\s"), "").contains(normalizedWord.replace(Regex("\\s"), ""))
                }
            }
        } catch (e: Exception) {
            logger.error("Error checking profanity for text: ${text.take(50)}...", e)
            return false
        }
    }
    
    fun filterProfanity(text: String, replacement: String = "***"): String {
        if (text.isBlank()) return text
        
        try {
            var filteredText = text
            val profanityWords = getProfanityWords()
            
            profanityWords.forEach { word ->
                val regex = Regex(Regex.escape(word), RegexOption.IGNORE_CASE)
                filteredText = regex.replace(filteredText, replacement)
            }
            
            return filteredText
        } catch (e: Exception) {
            logger.error("Error filtering profanity for text: ${text.take(50)}...", e)
            return text
        }
    }
    
    fun validateContent(title: String?, content: String?): ValidationResult {
        val violations = mutableListOf<String>()
        
        title?.let { 
            if (containsProfanity(it)) {
                violations.add("제목에 부적절한 표현이 포함되어 있습니다.")
            }
        }
        
        content?.let { 
            if (containsProfanity(it)) {
                violations.add("내용에 부적절한 표현이 포함되어 있습니다.")
            }
        }
        
        return ValidationResult(
            isValid = violations.isEmpty(),
            violations = violations
        )
    }
    
    fun addProfanityWord(word: String): Boolean {
        if (word.isBlank()) return false
        
        try {
            val ops = redisTemplate.opsForSet()
            val added = ops.add(PROFANITY_WORDS_KEY, word.trim().lowercase())
            redisTemplate.expire(PROFANITY_WORDS_KEY, CACHE_TTL_HOURS, TimeUnit.HOURS)
            
            if (added != null && added > 0) {
                logger.info("Added new profanity word: $word")
                return true
            }
            return false
        } catch (e: Exception) {
            logger.error("Failed to add profanity word: $word", e)
            return false
        }
    }
    
    fun removeProfanityWord(word: String): Boolean {
        if (word.isBlank()) return false
        
        try {
            val ops = redisTemplate.opsForSet()
            val removed = ops.remove(PROFANITY_WORDS_KEY, word.trim().lowercase())
            
            if (removed != null && removed > 0) {
                logger.info("Removed profanity word: $word")
                return true
            }
            return false
        } catch (e: Exception) {
            logger.error("Failed to remove profanity word: $word", e)
            return false
        }
    }
    
    fun getProfanityWordsCount(): Long {
        return try {
            redisTemplate.opsForSet().size(PROFANITY_WORDS_KEY) ?: 0L
        } catch (e: Exception) {
            logger.error("Failed to get profanity words count", e)
            0L
        }
    }
    
    private fun getProfanityWords(): Set<String> {
        return try {
            val ops = redisTemplate.opsForSet()
            val words = ops.members(PROFANITY_WORDS_KEY)?.mapNotNull { it as? String }?.toSet() ?: emptySet()
            
            if (words.isEmpty()) {
                logger.warn("No profanity words found in Redis, reinitializing...")
                initializeProfanityWords()
                return defaultProfanityWords
            }
            
            words
        } catch (e: Exception) {
            logger.warn("Redis unavailable, using default profanity list")
            defaultProfanityWords
        }
    }
    
    data class ValidationResult(
        val isValid: Boolean,
        val violations: List<String>
    )
}