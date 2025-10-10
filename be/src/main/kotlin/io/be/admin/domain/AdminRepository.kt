package io.be.admin.domain

import io.be.admin.domain.Admin
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
    
    /**
     * 서브도메인별 관리자 조회 (서브도메인 로그인용)
     */
    fun findByUsernameAndTeamSubdomainAndIsActive(username: String, teamSubdomain: String, isActive: Boolean): Admin?
    
    /**
     * 마스터 관리자 조회 (모든 서브도메인 접근 가능)
     */
    fun findByUsernameAndAdminLevelAndIsActive(username: String, adminLevel: AdminLevel, isActive: Boolean): Admin?
    
    /**
     * 특정 서브도메인의 관리자 목록 조회
     */
    fun findByTeamSubdomainAndIsActiveOrderByCreatedAtDesc(teamSubdomain: String, isActive: Boolean): List<Admin>
    
    /**
     * 마스터 관리자 목록 조회
     */
    fun findByAdminLevelAndIsActiveOrderByCreatedAtDesc(adminLevel: AdminLevel, isActive: Boolean): List<Admin>
    
    /**
     * 활성 관리자 수 조회
     */
    fun countByIsActive(isActive: Boolean): Long
    
}