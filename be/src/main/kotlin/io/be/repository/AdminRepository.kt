package io.be.repository

import io.be.entity.Admin
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.LocalDateTime
import java.util.*

@Repository
interface AdminRepository : JpaRepository<Admin, Long> {
    
    /**
     * 사용자명으로 관리자 조회
     */
    fun findByUsername(username: String): Admin?
    
    /**
     * 활성 상태인 관리자만 조회
     */
    fun findByUsernameAndIsActive(username: String, isActive: Boolean): Admin?
    
    /**
     * 사용자명 존재 여부 확인
     */
    fun existsByUsername(username: String): Boolean
    
    /**
     * 활성 관리자 목록 조회
     */
    fun findByIsActiveOrderByCreatedAtDesc(isActive: Boolean): List<Admin>
    
    /**
     * 마지막 로그인 시간 업데이트
     */
    @Modifying
    @Query("UPDATE Admin a SET a.lastLoginAt = :loginTime WHERE a.id = :adminId")
    fun updateLastLoginTime(adminId: Long, loginTime: LocalDateTime)
}