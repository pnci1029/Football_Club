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
        private const val USER_EXPIRATION_MINUTES = 1L // 1분으로 변경
        private val logger = LoggerFactory.getLogger(ViewCountService::class.java)
    }

    /**
     * 개별 조회수 조회 함수 (레디스만)
     * Community / Notice + id로 조회
     * 반환은 객체로 처리
     */
    fun getViewCount(
        contentType: ContentType,
        id: Long
    ): ViewCount {
        val viewCountKey = "${VIEW_COUNT_KEY_PREFIX}${contentType}:${id}"
        val count = redisTemplate.opsForValue().get(viewCountKey)?.toString()?.toLongOrNull() ?: 0L

        return ViewCount(
            type = contentType,
            id = id,
            viewCount = count
        )
    }

    /**
     * 총 조회수 조회 함수 (DB + 레디스 합계)
     * Community / Notice + id로 조회
     */
    fun getTotalViewCount(
        contentType: ContentType,
        id: Long
    ): ViewCount {
        // 레디스에서 현재 증가분 조회
        val redisViewCount = getViewCount(contentType, id).viewCount
        
        // DB에서 기존 조회수 조회
        val dbViewCount = try {
            when (contentType) {
                ContentType.NOTICE -> {
                    noticeRepository.findById(id).map { it.viewCount.toLong() }.orElse(0L)
                }
                ContentType.COMMUNITY -> {
                    communityPostRepository.findById(id).map { it.viewCount.toLong() }.orElse(0L)
                }
            }
        } catch (e: Exception) {
            logger.warn("Failed to get DB view count for ${contentType}:${id}", e)
            0L
        }

        val totalViewCount = dbViewCount + redisViewCount
        
        logger.debug("Total view count for ${contentType}:${id} - DB: $dbViewCount, Redis: $redisViewCount, Total: $totalViewCount")

        return ViewCount(
            type = contentType,
            id = id,
            viewCount = totalViewCount
        )
    }

    /**
     * 타입별 조회수 조회 함수
     * Community / Notice + id로 조회
     * 반환은 객체로 처리
     */
    fun getAllViewCounts(contentType: ContentType): List<ViewCount> {
        val pattern = "${VIEW_COUNT_KEY_PREFIX}${contentType}:*"
        val keys = redisTemplate.keys(pattern)

        return keys.mapNotNull { key ->
            val id = key.substringAfterLast(":").toLongOrNull()
            val count = redisTemplate.opsForValue().get(key)?.toString()?.toLongOrNull() ?: 0L
            id?.let {
                ViewCount(
                    type = contentType,
                    id = id,
                    viewCount = count
                )
            }
        }
    }

    /**
     * 조회수 증가 함수
     * 1. 사용자 식별정보로 이미 조회했는지 확인 (1분간)
     * 2. 1번이 없는경우 조회수 추가 & 사용자 식별정보 저장
     * 3. 1번이 있는 경우 continue
     */
    fun increaseViewCount(
        contentType: ContentType,
        id: Long,
        clientIp: String,
        userAgent: String = ""
    ): Boolean {
        // IP + User-Agent의 조합으로 더 강력한 사용자 식별자 생성
        val userIdentifier = generateUserIdentifier(clientIp, userAgent)
        
        logger.info("Increasing view count for ${contentType}:${id} by user identifier: ${userIdentifier.take(8)}...")
        val viewedKey = "${VIEWED_KEY_PREFIX}${contentType}:${id}:${userIdentifier}"
        val viewCountKey = "${VIEW_COUNT_KEY_PREFIX}${contentType}:${id}"

        // 1. userIdentifier로 1분짜리 임시 유저정보 확인
        val hasViewed = redisTemplate.hasKey(viewedKey)

        return if (!hasViewed) {
            try {
                // 2. Redis에서 조회수 증가 (안전한 increment)
                val currentValue = redisTemplate.opsForValue().get(viewCountKey)
                if (currentValue == null) {
                    // 키가 존재하지 않으면 1로 설정
                    redisTemplate.opsForValue().set(viewCountKey, "1")
                } else {
                    // 기존 값이 숫자인지 확인 후 safe increment
                    val numericValue = currentValue.toString().toLongOrNull()
                    if (numericValue != null) {
                        try {
                            // 안전한 increment 시도
                            redisTemplate.opsForValue().increment(viewCountKey)
                        } catch (e: Exception) {
                            // increment 실패 시 현재 값 + 1로 설정
                            logger.warn("Increment failed for key: $viewCountKey, setting to ${numericValue + 1}")
                            redisTemplate.opsForValue().set(viewCountKey, (numericValue + 1).toString())
                        }
                    } else {
                        // 기존 값이 숫자가 아니면 키를 삭제하고 1로 설정
                        logger.warn("Non-numeric value found in view count key: $viewCountKey, resetting to 1")
                        redisTemplate.delete(viewCountKey)
                        redisTemplate.opsForValue().set(viewCountKey, "1")
                    }
                }

                // 1분 만료 유저정보 저장
                redisTemplate.opsForValue().set(
                    viewedKey,
                    "1",
                    Duration.ofMinutes(USER_EXPIRATION_MINUTES)
                )
                
                logger.info("View count increased for ${contentType}:${id}")
                true
            } catch (e: Exception) {
                logger.error("Failed to increase view count for ${contentType}:${id}", e)
                // 에러 발생 시에도 사용자 기록은 저장해서 중복 방지
                try {
                    redisTemplate.opsForValue().set(
                        viewedKey,
                        "1",
                        Duration.ofMinutes(USER_EXPIRATION_MINUTES)
                    )
                } catch (userRecordError: Exception) {
                    logger.error("Failed to save user view record", userRecordError)
                }
                false
            }
        } else {
            logger.info("User already viewed ${contentType}:${id} within the last minute")
            false
        }
    }

    /**
     * 조회수 증가 함수 (하위 호환성용 - IP만 사용)
     * @deprecated IP만 사용하는 방식은 보안이 약합니다. IP + User-Agent 방식을 사용하세요.
     */
    @Deprecated("Use increaseViewCount(contentType, id, clientIp, userAgent) instead")
    fun increaseViewCount(
        contentType: ContentType,
        id: Long,
        userIdentifier: String
    ): Boolean {
        // 기존 방식과의 호환성을 위해 유지
        return increaseViewCount(contentType, id, userIdentifier, "")
    }

    /**
     * 사용자 식별자 생성 함수
     * IP + User-Agent 조합의 해시값을 생성하여 보안성 강화
     */
    private fun generateUserIdentifier(clientIp: String, userAgent: String): String {
        val combined = "${clientIp}:${userAgent}"
        return try {
            val md = MessageDigest.getInstance("SHA-256")
            val hashBytes = md.digest(combined.toByteArray())
            hashBytes.joinToString("") { "%02x".format(it) }
        } catch (e: Exception) {
            logger.warn("Failed to generate hash for user identifier, using fallback", e)
            // 해시 생성 실패 시 기본 식별자 사용
            "${clientIp}_${userAgent.hashCode()}"
        }
    }

    /**
     * 조회수 초기화 (관리자용)
     */
    fun resetViewCount(contentType: ContentType, id: Long) {
        val viewCountKey = "${VIEW_COUNT_KEY_PREFIX}${contentType}:${id}"
        redisTemplate.delete(viewCountKey)
        logger.info("View count reset for ${contentType}:${id}")
    }

    /**
     * 모든 조회수 키 조회 (스케줄링용)
     */
    fun getAllViewCountKeys(): Set<String> {
        return redisTemplate.keys("${VIEW_COUNT_KEY_PREFIX}*")
    }

    /**
     * 특정 키의 조회수 값 조회
     */
    fun getViewCountByKey(key: String): Long {
        return redisTemplate.opsForValue().get(key)?.toString()?.toLongOrNull() ?: 0L
    }

    /**
     * 조회수 키에서 타입과 ID 파싱
     */
    fun parseViewCountKey(key: String): Pair<ContentType, Long>? {
        val keyWithoutPrefix = key.removePrefix(VIEW_COUNT_KEY_PREFIX)
        val parts = keyWithoutPrefix.split(":")
        
        return if (parts.size == 2) {
            try {
                val contentType = ContentType.valueOf(parts[0])
                val id = parts[1].toLong()
                Pair(contentType, id)
            } catch (e: Exception) {
                logger.warn("Failed to parse view count key: $key", e)
                null
            }
        } else {
            null
        }
    }

    /**
     * 특정 키의 조회수 값 설정 (스케줄링 후 초기화용)
     */
    fun setViewCount(contentType: ContentType, id: Long, count: Long) {
        val viewCountKey = "${VIEW_COUNT_KEY_PREFIX}${contentType}:${id}"
        redisTemplate.opsForValue().set(viewCountKey, count.toString())
    }

    /**
     * 특정 사용자의 조회 기록 확인 (관리자용)
     */
    fun hasUserViewed(contentType: ContentType, id: Long, clientIp: String, userAgent: String): Boolean {
        val userIdentifier = generateUserIdentifier(clientIp, userAgent)
        val viewedKey = "${VIEWED_KEY_PREFIX}${contentType}:${id}:${userIdentifier}"
        return redisTemplate.hasKey(viewedKey)
    }

    /**
     * 특정 컨텐츠의 조회 기록 전체 삭제 (관리자용)
     */
    fun clearViewHistory(contentType: ContentType, id: Long) {
        val pattern = "${VIEWED_KEY_PREFIX}${contentType}:${id}:*"
        val keys = redisTemplate.keys(pattern)
        if (keys.isNotEmpty()) {
            redisTemplate.delete(keys)
            logger.info("Cleared ${keys.size} view history records for ${contentType}:${id}")
        }
    }

    /**
     * 만료된 조회 기록 정리 (스케줄링용)
     */
    fun cleanupExpiredViewHistory() {
        try {
            val pattern = "${VIEWED_KEY_PREFIX}*"
            val keys = redisTemplate.keys(pattern)
            var cleanedCount = 0
            
            for (key in keys) {
                // TTL이 -2인 키는 만료된 키이므로 삭제
                val ttl = redisTemplate.getExpire(key)
                if (ttl == -2L) {
                    redisTemplate.delete(key)
                    cleanedCount++
                }
            }
            
            if (cleanedCount > 0) {
                logger.info("Cleaned up $cleanedCount expired view history records")
            }
        } catch (e: Exception) {
            logger.error("Failed to cleanup expired view history", e)
        }
    }

    /**
     * 손상된 조회수 키 복구 (관리자용)
     */
    fun repairCorruptedViewCountKeys() {
        try {
            val pattern = "${VIEW_COUNT_KEY_PREFIX}*"
            val keys = redisTemplate.keys(pattern)
            var repairedCount = 0
            
            for (key in keys) {
                try {
                    val value = redisTemplate.opsForValue().get(key)
                    if (value != null) {
                        val numericValue = value.toString().toLongOrNull()
                        if (numericValue == null) {
                            // 숫자가 아닌 값이면 0으로 초기화
                            redisTemplate.opsForValue().set(key, "0")
                            repairedCount++
                            logger.warn("Repaired corrupted view count key: $key")
                        }
                    }
                } catch (e: Exception) {
                    // 개별 키 처리 실패는 로그만 남기고 계속 진행
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

    /**
     * 모든 조회수 관련 키 삭제 (긴급 복구용)
     */
    fun clearAllViewCountKeys() {
        try {
            val viewCountKeys = redisTemplate.keys("${VIEW_COUNT_KEY_PREFIX}*")
            val viewedKeys = redisTemplate.keys("${VIEWED_KEY_PREFIX}*")
            
            val allKeys = viewCountKeys + viewedKeys
            if (allKeys.isNotEmpty()) {
                redisTemplate.delete(allKeys)
                logger.info("Cleared ${allKeys.size} view count related keys (${viewCountKeys.size} count keys, ${viewedKeys.size} viewed keys)")
            } else {
                logger.info("No view count keys found to clear")
            }
        } catch (e: Exception) {
            logger.error("Failed to clear view count keys", e)
        }
    }

    /**
     * 전체 조회수 통계 조회 (관리자용)
     */
    fun getViewCountStats(): Map<String, Any> {
        return try {
            val viewCountKeys = redisTemplate.keys("${VIEW_COUNT_KEY_PREFIX}*")
            val viewedKeys = redisTemplate.keys("${VIEWED_KEY_PREFIX}*")
            
            var totalRedisViewCount = 0L
            var corruptedKeys = 0
            
            for (key in viewCountKeys) {
                try {
                    val value = redisTemplate.opsForValue().get(key)
                    if (value != null) {
                        val numericValue = value.toString().toLongOrNull()
                        if (numericValue != null) {
                            totalRedisViewCount += numericValue
                        } else {
                            corruptedKeys++
                        }
                    }
                } catch (e: Exception) {
                    corruptedKeys++
                }
            }
            
            mapOf(
                "totalViewCountKeys" to viewCountKeys.size,
                "totalViewedKeys" to viewedKeys.size,
                "totalRedisViewCount" to totalRedisViewCount,
                "corruptedKeys" to corruptedKeys
            )
        } catch (e: Exception) {
            logger.error("Failed to get view count stats", e)
            mapOf("error" to (e.message ?: "Unknown error"))
        }
    }
}