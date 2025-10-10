package io.be.admin.application

import io.be.admin.domain.Admin
import io.be.admin.domain.AdminLevel
import io.be.admin.domain.AdminRepository
import io.be.shared.exception.InvalidRequestException
import io.be.shared.exception.ConflictException
import io.be.shared.exception.NotFoundException
import org.slf4j.LoggerFactory
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

/**
 * 마스터 관리자 전용: 서브도메인 관리자 계정 관리 서비스
 */
@Service
@Transactional
class AdminManagementService(
    private val adminRepository: AdminRepository,
    private val passwordEncoder: PasswordEncoder
) {
    
    private val logger = LoggerFactory.getLogger(AdminManagementService::class.java)
    
    /**
     * 서브도메인 관리자 생성
     */
    fun createSubdomainAdmin(request: CreateSubdomainAdminRequest): AdminInfo {
        
        // 입력 검증
        validateCreateRequest(request)
        
        // 중복 검사
        if (adminRepository.existsByUsername(request.username)) {
            throw ConflictException("Username already exists: ${request.username}")
        }
        
        // 서브도메인별 관리자 중복 검사 (한 서브도메인에 여러 관리자 허용하려면 제거)
        val existingSubdomainAdmin = adminRepository.findByTeamSubdomainAndIsActiveOrderByCreatedAtDesc(request.teamSubdomain, true)
        if (existingSubdomainAdmin.isNotEmpty()) {
            logger.warn("Subdomain ${request.teamSubdomain} already has an admin: ${existingSubdomainAdmin.first().username}")
            // 경고만 하고 계속 진행 (여러 관리자 허용)
        }
        
        // 서브도메인 관리자 생성
        val admin = Admin(
            username = request.username,
            password = passwordEncoder.encode(request.password),
            role = "ADMIN",
            isActive = true,
            email = request.email,
            name = request.name,
            teamSubdomain = request.teamSubdomain,
            adminLevel = AdminLevel.SUBDOMAIN
        )
        
        val savedAdmin = adminRepository.save(admin)
        
        logger.info("✅ Subdomain admin created: ${savedAdmin.username} for subdomain: ${savedAdmin.teamSubdomain}")
        
        return AdminInfo.from(savedAdmin)
    }
    
    /**
     * 서브도메인 관리자 수정
     */
    fun updateSubdomainAdmin(adminId: Long, request: UpdateSubdomainAdminRequest): AdminInfo {
        
        val admin = adminRepository.findById(adminId).orElse(null)
            ?: throw NotFoundException("Admin not found: $adminId")
        
        if (admin.adminLevel != AdminLevel.SUBDOMAIN) {
            throw InvalidRequestException("adminId", adminId.toString(), "Cannot modify master admin")
        }
        
        // 사용자명 중복 검사 (변경하는 경우)
        if (request.username != admin.username && adminRepository.existsByUsername(request.username)) {
            throw ConflictException("Username already exists: ${request.username}")
        }
        
        // 관리자 정보 업데이트
        val updatedAdmin = admin.copy(
            username = request.username,
            password = if (request.password.isNotBlank()) passwordEncoder.encode(request.password) else admin.password,
            email = request.email,
            name = request.name,
            teamSubdomain = request.teamSubdomain,
            isActive = request.isActive,
            updatedAt = LocalDateTime.now()
        )
        
        val savedAdmin = adminRepository.save(updatedAdmin)
        
        logger.info("✅ Subdomain admin updated: ${savedAdmin.username}")
        
        return AdminInfo.from(savedAdmin)
    }
    
    /**
     * 서브도메인 관리자 삭제 (비활성화)
     */
    fun deleteSubdomainAdmin(adminId: Long) {
        
        val admin = adminRepository.findById(adminId).orElse(null)
            ?: throw NotFoundException("Admin not found: $adminId")
        
        if (admin.adminLevel != AdminLevel.SUBDOMAIN) {
            throw InvalidRequestException("adminId", adminId.toString(), "Cannot delete master admin")
        }
        
        val deactivatedAdmin = admin.copy(
            isActive = false,
            updatedAt = LocalDateTime.now()
        )
        
        adminRepository.save(deactivatedAdmin)
        
        logger.info("✅ Subdomain admin deactivated: ${admin.username}")
    }
    
    /**
     * 전체 관리자 목록 조회 (마스터 전용)
     */
    @Transactional(readOnly = true)
    fun getAllAdmins(pageable: Pageable): Page<AdminInfo> {
        return adminRepository.findByIsActiveOrderByCreatedAtDesc(true, pageable)
            .map { AdminInfo.from(it) }
    }
    
    /**
     * 서브도메인별 관리자 목록 조회
     */
    @Transactional(readOnly = true)
    fun getAdminsBySubdomain(teamSubdomain: String): List<AdminInfo> {
        return adminRepository.findByTeamSubdomainAndIsActiveOrderByCreatedAtDesc(teamSubdomain, true)
            .map { AdminInfo.from(it) }
    }
    
    /**
     * 마스터 관리자 목록 조회
     */
    @Transactional(readOnly = true)
    fun getMasterAdmins(): List<AdminInfo> {
        return adminRepository.findByAdminLevelAndIsActiveOrderByCreatedAtDesc(AdminLevel.MASTER, true)
            .map { AdminInfo.from(it) }
    }
    
    /**
     * 관리자 상세 조회
     */
    @Transactional(readOnly = true)
    fun getAdminById(adminId: Long): AdminInfo {
        val admin = adminRepository.findById(adminId).orElse(null)
            ?: throw NotFoundException("Admin not found: $adminId")
        
        return AdminInfo.from(admin)
    }
    
    /**
     * 서브도메인 관리자 생성 요청 검증
     */
    private fun validateCreateRequest(request: CreateSubdomainAdminRequest) {
        if (request.username.isBlank()) {
            throw InvalidRequestException("username", request.username, "Username is required")
        }
        
        if (request.username.length < 3 || request.username.length > 50) {
            throw InvalidRequestException("username", request.username, "Username must be between 3 and 50 characters")
        }
        
        if (request.password.length < 6) {
            throw InvalidRequestException("password", "***", "Password must be at least 6 characters")
        }
        
        if (request.teamSubdomain.isBlank()) {
            throw InvalidRequestException("teamSubdomain", request.teamSubdomain, "Team subdomain is required")
        }
        
        // 사용자명 패턴 검증 (영문, 숫자, 언더스코어만 허용)
        if (!request.username.matches(Regex("^[a-zA-Z0-9_]+$"))) {
            throw InvalidRequestException("username", request.username, "Username can only contain letters, numbers, and underscores")
        }
        
        // 서브도메인 패턴 검증
        if (!request.teamSubdomain.matches(Regex("^[a-zA-Z0-9-]+$"))) {
            throw InvalidRequestException("teamSubdomain", request.teamSubdomain, "Team subdomain can only contain letters, numbers, and hyphens")
        }
    }
}

/**
 * 서브도메인 관리자 생성 요청 DTO
 */
data class CreateSubdomainAdminRequest(
    val username: String,
    val password: String,
    val email: String?,
    val name: String?,
    val teamSubdomain: String
)

/**
 * 서브도메인 관리자 수정 요청 DTO
 */
data class UpdateSubdomainAdminRequest(
    val username: String,
    val password: String = "", // 빈 문자열이면 비밀번호 변경 안함
    val email: String?,
    val name: String?,
    val teamSubdomain: String,
    val isActive: Boolean = true
)