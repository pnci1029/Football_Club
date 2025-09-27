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
        // 기본 비속어 목록
        "시발", "씨발", "시팔", "씨팔", "ㅅㅂ", "ㅆㅂ",
        "개새끼", "개놈", "개년", "개자식", "개빢",
        "병신", "븅신", "ㅂㅅ", "멍청이", "바보",
        "좆", "좇", "존나", "ㅈㄴ", "지랄", "ㅈㄹ",
        "꺼져", "닥쳐", "죽어", "뒤져",
        "개똥", "똥개", "쓰레기", "애미", "애비",
        "호로", "창녀", "걸레", "썅", "새끼",
        "미친", "또라이", "정신병", "정신나간",
        "한남", "한녀", "페미", "맘충", "틀딱",
        "급식충", "일베", "좌좀", "우좀", "종북",
        "닌겐", "쪽발이", "쪽빨이", "원숭이",
        "fuck", "shit", "bitch", "damn", "ass"
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
            logger.error("Failed to initialize profanity words in Redis", e)
        }
    }
    
    fun containsProfanity(text: String): Boolean {
        if (text.isBlank()) return false
        
        try {
            val cleanText = text.replace(Regex("[^가-힣a-zA-Z0-9\\s]"), "").lowercase()
            val profanityWords = getProfanityWords()
            
            return profanityWords.any { word ->
                cleanText.contains(word.lowercase()) ||
                cleanText.replace("\\s".toRegex(), "").contains(word.lowercase().replace("\\s".toRegex(), ""))
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
            logger.error("Failed to get profanity words from Redis, using default list", e)
            defaultProfanityWords
        }
    }
    
    data class ValidationResult(
        val isValid: Boolean,
        val violations: List<String>
    )
}