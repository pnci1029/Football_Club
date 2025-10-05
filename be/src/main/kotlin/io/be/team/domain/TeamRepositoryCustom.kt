package io.be.team.domain

import java.time.LocalDateTime

interface TeamRepositoryCustom {
    
    // 소프트 딜리트
    fun softDeleteById(id: Long, deletedAt: LocalDateTime)
}