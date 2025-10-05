package io.be.repository

import io.be.entity.Admin
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface AdminRepository : JpaRepository<Admin, Long>, AdminRepositoryCustom {
    
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
    
}