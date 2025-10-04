package io.be.service

import io.be.enums.ContentType
import io.be.repository.CommunityPostRepository
import io.be.repository.NoticeRepository
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ViewCountSyncService(
    private val viewCountService: ViewCountService,
    private val noticeRepository: NoticeRepository,
    private val communityPostRepository: CommunityPostRepository
) {
    companion object {
        private val logger = LoggerFactory.getLogger(ViewCountSyncService::class.java)
    }

    /**
     * 1분마다 Redis의 조회수를 DB에 동기화
     */
    @Scheduled(fixedRate = 60000) // 1분 = 60,000ms
    @Transactional
    fun syncViewCountsToDatabase() {
        try {
            val allKeys = viewCountService.getAllViewCountKeys()
            if (allKeys.isEmpty()) return
            
            var syncedCount = 0
            for (key in allKeys) {
                try {
                    val parsedKey = viewCountService.parseViewCountKey(key)
                    if (parsedKey != null) {
                        val (contentType, contentId) = parsedKey
                        val redisViewCount = viewCountService.getViewCountByKey(key)
                        
                        if (redisViewCount > 0) {
                            updateDatabaseViewCount(contentType, contentId, redisViewCount)
                            viewCountService.setViewCount(contentType, contentId, 0)
                            syncedCount++
                        }
                    }
                } catch (e: Exception) {
                    logger.error("Failed to sync view count for key: $key", e)
                }
            }
            
            if (syncedCount > 0) {
                logger.info("Synced $syncedCount view counts to database")
            }
        } catch (e: Exception) {
            logger.error("Error during view count synchronization", e)
        }
    }

    /**
     * DB의 조회수 업데이트 (bulk update로 효율성 개선)
     */
    private fun updateDatabaseViewCount(contentType: ContentType, contentId: Long, viewCount: Long) {
        try {
            when (contentType) {
                ContentType.NOTICE -> {
                    noticeRepository.incrementViewCountBy(contentId, viewCount)
                }
                ContentType.COMMUNITY -> {
                    communityPostRepository.incrementViewCountBy(contentId, viewCount)
                }
            }
        } catch (e: Exception) {
            logger.error("Failed to update database view count for $contentType:$contentId", e)
        }
    }

    /**
     * 수동 동기화 메서드 (관리자용)
     */
    @Transactional
    fun forceSyncViewCountsToDatabase() {
        logger.info("Force synchronization requested")
        syncViewCountsToDatabase()
    }

    /**
     * 특정 컨텐츠의 조회수 동기화
     */
    @Transactional
    fun syncSpecificViewCount(contentType: ContentType, contentId: Long) {
        try {
            val viewCount = viewCountService.getViewCount(contentType, contentId)
            if (viewCount.viewCount > 0) {
                updateDatabaseViewCount(contentType, contentId, viewCount.viewCount)
                viewCountService.setViewCount(contentType, contentId, 0)
                logger.info("Synced specific view count for $contentType:$contentId")
            }
        } catch (e: Exception) {
            logger.error("Failed to sync specific view count for $contentType:$contentId", e)
        }
    }

    /**
     * 10분마다 만료된 조회 기록 정리
     */
    @Scheduled(fixedRate = 600000) // 10분 = 600,000ms
    fun cleanupExpiredViewHistory() {
        try {
            viewCountService.cleanupExpiredViewHistory()
        } catch (e: Exception) {
            logger.error("Error during cleanup of expired view history", e)
        }
    }

    /**
     * 1시간마다 손상된 조회수 키 복구
     */
    @Scheduled(fixedRate = 3600000) // 1시간 = 3,600,000ms
    fun repairCorruptedKeys() {
        try {
            viewCountService.repairCorruptedViewCountKeys()
        } catch (e: Exception) {
            logger.error("Error during repair of corrupted view count keys", e)
        }
    }
}