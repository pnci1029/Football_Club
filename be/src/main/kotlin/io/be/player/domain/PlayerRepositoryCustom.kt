package io.be.player.domain

import java.time.LocalDateTime

interface PlayerRepositoryCustom {
    
    // 소프트 딜리트
    fun softDeleteById(id: Long, deletedAt: LocalDateTime)
}