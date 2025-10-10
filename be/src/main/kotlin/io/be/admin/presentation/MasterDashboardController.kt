package io.be.admin.presentation

import io.be.admin.application.MasterDashboardService
import io.be.admin.application.SystemOverviewResponse
import io.be.admin.application.SubdomainStatsResponse
import io.be.admin.application.RecentActivityResponse
import io.be.admin.application.AdminInfo
import io.be.admin.domain.AdminLevel
import io.be.shared.dto.ApiResponse
import io.be.shared.security.AdminPermissionRequired
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import jakarta.servlet.http.HttpServletRequest

/**
 * 마스터 관리자 전용: 전체 시스템 대시보드 컨트롤러
 */
@RestController
@RequestMapping("/api/v1/admin/master/dashboard")
@AdminPermissionRequired(level = AdminLevel.MASTER, enforceSubdomainRestriction = false)
class MasterDashboardController(
    private val masterDashboardService: MasterDashboardService
) {
    
    private val logger = LoggerFactory.getLogger(MasterDashboardController::class.java)
    
    /**
     * 전체 시스템 개요 통계 조회
     */
    @GetMapping("/overview")
    fun getSystemOverview(request: HttpServletRequest): ResponseEntity<ApiResponse<SystemOverviewResponse>> {
        
        val adminInfo = request.getAttribute("adminInfo") as AdminInfo
        logger.info("Master admin ${adminInfo.username} requested system overview")
        
        val overview = masterDashboardService.getSystemOverview()
        return ResponseEntity.ok(ApiResponse.success(overview))
    }
    
    /**
     * 서브도메인별 상세 통계 조회
     */
    @GetMapping("/subdomains")
    fun getSubdomainStats(request: HttpServletRequest): ResponseEntity<ApiResponse<List<SubdomainStatsResponse>>> {
        
        val adminInfo = request.getAttribute("adminInfo") as AdminInfo
        logger.info("Master admin ${adminInfo.username} requested subdomain statistics")
        
        val subdomainStats = masterDashboardService.getSubdomainStats()
        return ResponseEntity.ok(ApiResponse.success(subdomainStats))
    }
    
    /**
     * 최근 시스템 활동 조회
     */
    @GetMapping("/activities")
    fun getRecentActivities(request: HttpServletRequest): ResponseEntity<ApiResponse<List<RecentActivityResponse>>> {
        
        val adminInfo = request.getAttribute("adminInfo") as AdminInfo
        logger.info("Master admin ${adminInfo.username} requested recent activities")
        
        val activities = masterDashboardService.getRecentActivities()
        return ResponseEntity.ok(ApiResponse.success(activities))
    }
    
    /**
     * 종합 대시보드 데이터 조회 (한 번에 모든 데이터)
     */
    @GetMapping("/comprehensive")
    fun getComprehensiveDashboard(request: HttpServletRequest): ResponseEntity<ApiResponse<ComprehensiveDashboardResponse>> {
        
        val adminInfo = request.getAttribute("adminInfo") as AdminInfo
        logger.info("Master admin ${adminInfo.username} requested comprehensive dashboard")
        
        val overview = masterDashboardService.getSystemOverview()
        val subdomainStats = masterDashboardService.getSubdomainStats()
        val activities = masterDashboardService.getRecentActivities()
        
        val comprehensiveData = ComprehensiveDashboardResponse(
            overview = overview,
            subdomainStats = subdomainStats,
            recentActivities = activities
        )
        
        return ResponseEntity.ok(ApiResponse.success(comprehensiveData))
    }
}

/**
 * 종합 대시보드 응답 DTO
 */
data class ComprehensiveDashboardResponse(
    val overview: SystemOverviewResponse,
    val subdomainStats: List<SubdomainStatsResponse>,
    val recentActivities: List<RecentActivityResponse>
)