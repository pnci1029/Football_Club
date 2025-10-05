package io.be.admin.domain

import java.time.LocalDateTime

interface AdminRepositoryCustom {
    
    // 마지막 로그인 시간 업데이트
    fun updateLastLoginTime(adminId: Long, loginTime: LocalDateTime)
}