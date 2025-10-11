package io.be.admin.presentation

import io.be.admin.application.AdminManagementService
import io.be.admin.application.CreateSubdomainAdminRequest
import io.be.admin.application.UpdateSubdomainAdminRequest
import io.be.admin.application.AdminInfo
import io.be.admin.domain.AdminLevel
import io.be.shared.util.ApiResponse
import io.be.shared.security.AdminPermissionRequired
import org.slf4j.LoggerFactory
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.web.PageableDefault
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import jakarta.servlet.http.HttpServletRequest

/**
 * 마스터 관리자 전용: 서브도메인 관리자 관리 컨트롤러
 */
@RestController
@RequestMapping("/api/v1/admin/management")
@AdminPermissionRequired(level = AdminLevel.MASTER, enforceSubdomainRestriction = false)
class AdminManagementController(
    private val adminManagementService: AdminManagementService
) {
    
    private val logger = LoggerFactory.getLogger(AdminManagementController::class.java)
    
    /**
     * 전체 관리자 목록 조회 (페이징)
     */
    @GetMapping("/admins")
    fun getAllAdmins(
        @PageableDefault(size = 20) pageable: Pageable,
        request: HttpServletRequest
    ): ResponseEntity<ApiResponse<Page<AdminInfo>>> {
        
        val adminInfo = request.getAttribute("adminInfo") as AdminInfo
        logger.info("Master admin ${adminInfo.username} requested all admins list")
        
        val admins = adminManagementService.getAllAdmins(pageable)
        return ResponseEntity.ok(ApiResponse.success(admins))
    }
    
    /**
     * 마스터 관리자 목록 조회
     */
    @GetMapping("/admins/masters")
    fun getMasterAdmins(request: HttpServletRequest): ResponseEntity<ApiResponse<List<AdminInfo>>> {
        
        val adminInfo = request.getAttribute("adminInfo") as AdminInfo
        logger.info("Master admin ${adminInfo.username} requested master admins list")
        
        val masterAdmins = adminManagementService.getMasterAdmins()
        return ResponseEntity.ok(ApiResponse.success(masterAdmins))
    }
    
    /**
     * 서브도메인별 관리자 목록 조회
     */
    @GetMapping("/admins/subdomain/{teamSubdomain}")
    fun getAdminsBySubdomain(
        @PathVariable teamSubdomain: String,
        request: HttpServletRequest
    ): ResponseEntity<ApiResponse<List<AdminInfo>>> {
        
        val adminInfo = request.getAttribute("adminInfo") as AdminInfo
        logger.info("Master admin ${adminInfo.username} requested admins for subdomain: $teamSubdomain")
        
        val subdomainAdmins = adminManagementService.getAdminsBySubdomain(teamSubdomain)
        return ResponseEntity.ok(ApiResponse.success(subdomainAdmins))
    }
    
    /**
     * 관리자 상세 조회
     */
    @GetMapping("/admins/{adminId}")
    fun getAdminById(
        @PathVariable adminId: Long,
        request: HttpServletRequest
    ): ResponseEntity<ApiResponse<AdminInfo>> {
        
        val adminInfo = request.getAttribute("adminInfo") as AdminInfo
        logger.info("Master admin ${adminInfo.username} requested admin details: $adminId")
        
        val admin = adminManagementService.getAdminById(adminId)
        return ResponseEntity.ok(ApiResponse.success(admin))
    }
    
    /**
     * 서브도메인 관리자 생성
     */
    @PostMapping("/admins/subdomain")
    fun createSubdomainAdmin(
        @RequestBody request: CreateSubdomainAdminRequest,
        httpRequest: HttpServletRequest
    ): ResponseEntity<ApiResponse<AdminInfo>> {
        
        val adminInfo = httpRequest.getAttribute("adminInfo") as AdminInfo
        logger.info("Master admin ${adminInfo.username} creating subdomain admin: ${request.username} for ${request.teamSubdomain}")
        
        val createdAdmin = adminManagementService.createSubdomainAdmin(request)
        return ResponseEntity.ok(ApiResponse.success(createdAdmin))
    }
    
    /**
     * 서브도메인 관리자 수정
     */
    @PutMapping("/admins/{adminId}")
    fun updateSubdomainAdmin(
        @PathVariable adminId: Long,
        @RequestBody request: UpdateSubdomainAdminRequest,
        httpRequest: HttpServletRequest
    ): ResponseEntity<ApiResponse<AdminInfo>> {
        
        val adminInfo = httpRequest.getAttribute("adminInfo") as AdminInfo
        logger.info("Master admin ${adminInfo.username} updating admin: $adminId")
        
        val updatedAdmin = adminManagementService.updateSubdomainAdmin(adminId, request)
        return ResponseEntity.ok(ApiResponse.success(updatedAdmin))
    }
    
    /**
     * 서브도메인 관리자 삭제 (비활성화)
     */
    @DeleteMapping("/admins/{adminId}")
    fun deleteSubdomainAdmin(
        @PathVariable adminId: Long,
        httpRequest: HttpServletRequest
    ): ResponseEntity<ApiResponse<String>> {
        
        val adminInfo = httpRequest.getAttribute("adminInfo") as AdminInfo
        logger.info("Master admin ${adminInfo.username} deleting admin: $adminId")
        
        adminManagementService.deleteSubdomainAdmin(adminId)
        return ResponseEntity.ok(ApiResponse.success("Admin deleted successfully"))
    }
    
    /**
     * 서브도메인 목록 조회 (관리자 생성용)
     */
    @GetMapping("/subdomains")
    fun getAvailableSubdomains(request: HttpServletRequest): ResponseEntity<ApiResponse<List<String>>> {
        
        val adminInfo = request.getAttribute("adminInfo") as AdminInfo
        logger.info("Master admin ${adminInfo.username} requested available subdomains")
        
        // TODO: 실제 서브도메인 목록을 DB나 설정에서 가져와야 함
        // 현재는 예시로 하드코딩
        val availableSubdomains = listOf(
            "team1", "team2", "team3", "team4", "team5",
            "manchester", "barcelona", "realmadrid", "liverpool", "arsenal"
        )
        
        return ResponseEntity.ok(ApiResponse.success(availableSubdomains))
    }
    
    /**
     * 관리자 통계 조회
     */
    @GetMapping("/stats")
    fun getAdminStats(request: HttpServletRequest): ResponseEntity<ApiResponse<AdminStatsResponse>> {
        
        val adminInfo = request.getAttribute("adminInfo") as AdminInfo
        logger.info("Master admin ${adminInfo.username} requested admin statistics")
        
        val masterAdmins = adminManagementService.getMasterAdmins()
        val allAdmins = adminManagementService.getAllAdmins(Pageable.unpaged())
        
        val stats = AdminStatsResponse(
            totalAdmins = allAdmins.totalElements.toInt(),
            masterAdmins = masterAdmins.size,
            subdomainAdmins = allAdmins.totalElements.toInt() - masterAdmins.size,
            activeAdmins = allAdmins.totalElements.toInt() // 이미 active만 조회함
        )
        
        return ResponseEntity.ok(ApiResponse.success(stats))
    }
}

/**
 * 관리자 통계 응답 DTO
 */
data class AdminStatsResponse(
    val totalAdmins: Int,
    val masterAdmins: Int,
    val subdomainAdmins: Int,
    val activeAdmins: Int
)