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

    @Scheduled(fixedRate = 60000) // 1분마다
    @Transactional
    fun syncViewCountsToDatabase() {
        try {
            val keys = viewCountService.getAllViewCountKeys()
            if (keys.isEmpty()) return
            
            var syncedCount = 0
            keys.forEach { key ->
                try {
                    val parsed = viewCountService.parseViewCountKey(key) ?: return@forEach
                    val (contentType, contentId) = parsed
                    val redisCount = viewCountService.getViewCountByKey(key)
                    
                    if (redisCount > 0) {
                        updateDatabaseViewCount(contentType, contentId, redisCount)
                        viewCountService.setViewCount(contentType, contentId, 0)
                        syncedCount++
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

    @Scheduled(fixedRate = 600000) // 10분마다
    fun cleanupExpiredViewHistory() {
        try {
            viewCountService.cleanupExpiredViewHistory()
        } catch (e: Exception) {
            logger.error("Error during cleanup of expired view history", e)
        }
    }

    @Scheduled(fixedRate = 3600000) // 1시간마다
    fun repairCorruptedKeys() {
        try {
            viewCountService.repairCorruptedViewCountKeys()
        } catch (e: Exception) {
            logger.error("Error during repair of corrupted view count keys", e)
        }
    }

    private fun updateDatabaseViewCount(contentType: ContentType, contentId: Long, viewCount: Long) {
        try {
            when (contentType) {
                ContentType.NOTICE -> noticeRepository.incrementViewCountBy(contentId, viewCount)
                ContentType.COMMUNITY -> communityPostRepository.incrementViewCountBy(contentId, viewCount)
            }
        } catch (e: Exception) {
            logger.error("Failed to update database view count for $contentType:$contentId", e)
        }
    }
}