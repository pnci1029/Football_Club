package io.be.service

import io.be.dto.ViewCount
import io.be.enums.ContentType
import io.be.repository.NoticeRepository
import io.be.repository.CommunityPostRepository
import org.slf4j.LoggerFactory
import org.springframework.data.redis.core.RedisTemplate
import org.springframework.stereotype.Service
import java.time.Duration
import java.security.MessageDigest

@Service
class ViewCountService(
    private val redisTemplate: RedisTemplate<String, Any>,
    private val noticeRepository: NoticeRepository,
    private val communityPostRepository: CommunityPostRepository
) {
    companion object {
        private const val VIEW_COUNT_KEY_PREFIX = "view_count:"
        private const val VIEWED_KEY_PREFIX = "viewed:"
        private const val USER_EXPIRATION_MINUTES = 1L
        private val logger = LoggerFactory.getLogger(ViewCountService::class.java)
    }

    // DB + Redis 조회수 합계 조회 (프론트에서 표시용)
    fun getTotalViewCount(contentType: ContentType, id: Long): ViewCount {
        val redisCount = getRedisViewCount(contentType, id)
        val dbCount = getDbViewCount(contentType, id)
        
        return ViewCount(
            type = contentType,
            id = id,
            viewCount = dbCount + redisCount
        )
    }

    // 상세페이지 조회시 Redis 조회수 증가 (1분 중복방지)
    fun increaseViewCount(contentType: ContentType, id: Long, clientIp: String, userAgent: String = ""): Boolean {
        val userIdentifier = generateUserIdentifier(clientIp, userAgent)
        val viewedKey = "${VIEWED_KEY_PREFIX}${contentType}:${id}:${userIdentifier}"
        val viewCountKey = "${VIEW_COUNT_KEY_PREFIX}${contentType}:${id}"

        if (redisTemplate.hasKey(viewedKey)) return false

        return try {
            incrementRedisCount(viewCountKey)
            redisTemplate.opsForValue().set(viewedKey, "1", Duration.ofMinutes(USER_EXPIRATION_MINUTES))
            true
        } catch (e: Exception) {
            logger.error("Failed to increase view count for ${contentType}:${id}", e)
            try {
                redisTemplate.opsForValue().set(viewedKey, "1", Duration.ofMinutes(USER_EXPIRATION_MINUTES))
            } catch (ex: Exception) {
                logger.error("Failed to save user view record", ex)
            }
            false
        }
    }

    // === 스케줄링용 메서드들 (ViewCountSyncService에서 사용) ===
    
    // Redis의 모든 조회수 키 조회
    fun getAllViewCountKeys(): Set<String> = redisTemplate.keys("${VIEW_COUNT_KEY_PREFIX}*")
    
    // 특정 키의 조회수 값 조회
    fun getViewCountByKey(key: String): Long = 
        redisTemplate.opsForValue().get(key)?.toString()?.toLongOrNull() ?: 0L
    
    // Redis 키에서 ContentType과 ID 파싱
    fun parseViewCountKey(key: String): Pair<ContentType, Long>? {
        val parts = key.removePrefix(VIEW_COUNT_KEY_PREFIX).split(":")
        return if (parts.size == 2) {
            try {
                Pair(ContentType.valueOf(parts[0]), parts[1].toLong())
            } catch (e: Exception) {
                null
            }
        } else null
    }
    
    // Redis 조회수 값 설정 (동기화 후 0으로 초기화용)
    fun setViewCount(contentType: ContentType, id: Long, count: Long) {
        val key = "${VIEW_COUNT_KEY_PREFIX}${contentType}:${id}"
        redisTemplate.opsForValue().set(key, count.toString())
    }

    // 만료된 사용자 조회기록 정리 (10분마다 실행)
    fun cleanupExpiredViewHistory() {
        try {
            val keys = redisTemplate.keys("${VIEWED_KEY_PREFIX}*")
            val expiredKeys = keys.filter { redisTemplate.getExpire(it) == -2L }
            if (expiredKeys.isNotEmpty()) {
                redisTemplate.delete(expiredKeys)
            }
        } catch (e: Exception) {
            logger.error("Failed to cleanup expired view history", e)
        }
    }

    // 손상된 Redis 키 복구 (1시간마다 실행)
    fun repairCorruptedViewCountKeys() {
        try {
            val keys = redisTemplate.keys("${VIEW_COUNT_KEY_PREFIX}*")
            var repairedCount = 0
            
            keys.forEach { key ->
                try {
                    val value = redisTemplate.opsForValue().get(key)
                    if (value?.toString()?.toLongOrNull() == null) {
                        redisTemplate.opsForValue().set(key, "0")
                        repairedCount++
                    }
                } catch (e: Exception) {
                    logger.error("Failed to check key: $key", e)
                }
            }
            
            if (repairedCount > 0) {
                logger.info("Repaired $repairedCount corrupted view count keys")
            }
        } catch (e: Exception) {
            logger.error("Failed to repair corrupted view count keys", e)
        }
    }

    // === Private 헬퍼 메서드들 ===
    
    // Redis에서 조회수 조회
    private fun getRedisViewCount(contentType: ContentType, id: Long): Long {
        val key = "${VIEW_COUNT_KEY_PREFIX}${contentType}:${id}"
        return redisTemplate.opsForValue().get(key)?.toString()?.toLongOrNull() ?: 0L
    }

    // DB에서 조회수 조회
    private fun getDbViewCount(contentType: ContentType, id: Long): Long {
        return try {
            when (contentType) {
                ContentType.NOTICE -> 
                    noticeRepository.findById(id).map { it.viewCount.toLong() }.orElse(0L)
                ContentType.COMMUNITY -> 
                    communityPostRepository.findById(id).map { it.viewCount.toLong() }.orElse(0L)
            }
        } catch (e: Exception) {
            0L
        }
    }

    // Redis 조회수 안전하게 증가
    private fun incrementRedisCount(viewCountKey: String) {
        val currentValue = redisTemplate.opsForValue().get(viewCountKey)
        if (currentValue == null) {
            redisTemplate.opsForValue().set(viewCountKey, "1")
        } else {
            val numericValue = currentValue.toString().toLongOrNull()
            if (numericValue != null) {
                try {
                    redisTemplate.opsForValue().increment(viewCountKey)
                } catch (e: Exception) {
                    redisTemplate.opsForValue().set(viewCountKey, (numericValue + 1).toString())
                }
            } else {
                redisTemplate.delete(viewCountKey)
                redisTemplate.opsForValue().set(viewCountKey, "1")
            }
        }
    }

    // IP + User-Agent로 사용자 식별자 생성 (SHA-256 해시)
    private fun generateUserIdentifier(clientIp: String, userAgent: String): String {
        val combined = "${clientIp}:${userAgent}"
        return try {
            val md = MessageDigest.getInstance("SHA-256")
            val hashBytes = md.digest(combined.toByteArray())
            hashBytes.joinToString("") { "%02x".format(it) }
        } catch (e: Exception) {
            "${clientIp}_${userAgent.hashCode()}"
        }
    }
}