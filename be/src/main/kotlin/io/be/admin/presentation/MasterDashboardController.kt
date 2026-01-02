package io.be.admin.presentation

import io.be.admin.application.MasterDashboardService
import io.be.admin.dto.SystemOverviewResponse
import io.be.admin.dto.SubdomainStatsResponse
import io.be.admin.dto.RecentActivityResponse
import io.be.admin.dto.AdminInfo
import io.be.admin.domain.AdminLevel
import io.be.admin.dto.ComprehensiveDashboardResponse
import io.be.shared.security.AdminPermissionRequired
import org.slf4j.LoggerFactory
import io.be.shared.util.ApiResponse
import org.springframework.web.bind.annotation.*
import jakarta.servlet.http.HttpServletRequest

/**
 * 마스터 관리자 전용: 전체 시스템 대시보드 컨트롤러
 */
@RestController
@RequestMapping("/v1/admin/master/dashboard")
@AdminPermissionRequired(level = AdminLevel.MASTER, enforceSubdomainRestriction = false)
class MasterDashboardController(
    private val masterDashboardService: MasterDashboardService
) {
    
    private val logger = LoggerFactory.getLogger(MasterDashboardController::class.java)
    
    /**
     * 전체 시스템 개요 통계 조회
     */
    @GetMapping("/overview")
    fun getSystemOverview(request: HttpServletRequest): ApiResponse<SystemOverviewResponse> {
        
        val adminInfo = request.getAttribute("adminInfo") as AdminInfo
        logger.info("Master admin ${adminInfo.username} requested system overview")
        
        val overview = masterDashboardService.getSystemOverview()
        return ApiResponse.success(overview)
    }
    
    /**
     * 서브도메인별 상세 통계 조회
     */
    @GetMapping("/subdomains")
    fun getSubdomainStats(request: HttpServletRequest): ApiResponse<List<SubdomainStatsResponse>> {
        
        val adminInfo = request.getAttribute("adminInfo") as AdminInfo
        logger.info("Master admin ${adminInfo.username} requested subdomain statistics")
        
        val subdomainStats = masterDashboardService.getSubdomainStats()
        return ApiResponse.success(subdomainStats)
    }
    
    /**
     * 최근 시스템 활동 조회
     */
    @GetMapping("/activities")
    fun getRecentActivities(request: HttpServletRequest): ApiResponse<List<RecentActivityResponse>> {
        
        val adminInfo = request.getAttribute("adminInfo") as AdminInfo
        logger.info("Master admin ${adminInfo.username} requested recent activities")
        
        val activities = masterDashboardService.getRecentActivities()
        return ApiResponse.success(activities)
    }
    
    /**
     * 종합 대시보드 데이터 조회 (한 번에 모든 데이터)
     */
    @GetMapping("/comprehensive")
    fun getComprehensiveDashboard(request: HttpServletRequest): ApiResponse<ComprehensiveDashboardResponse> {
        
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
        
        return ApiResponse.success(comprehensiveData)
    }
}

