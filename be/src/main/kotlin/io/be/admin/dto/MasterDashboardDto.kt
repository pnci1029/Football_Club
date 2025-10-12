package io.be.admin.dto

import java.time.LocalDateTime

/**
 * 전체 시스템 개요 응답 DTO
 */
data class SystemOverviewResponse(
    // 팀 통계
    val totalTeams: Int,
    val totalPlayers: Int,
    val totalStadiums: Int,
    val totalMatches: Int,
    
    // 관리자 통계
    val totalAdmins: Int,
    val masterAdmins: Int,
    val subdomainAdmins: Int,
    
    // 콘텐츠 통계
    val totalPosts: Int,
    val totalComments: Int,
    val totalNotices: Int,
    
    // 최근 활동 (30일)
    val recentPosts: Int,
    val recentNotices: Int
)

/**
 * 서브도메인별 통계 응답 DTO
 */
data class SubdomainStatsResponse(
    val teamCode: String,
    val teamName: String,
    val teamId: Long,
    val playerCount: Int,
    val stadiumCount: Int,
    val adminCount: Int,
    val postCount: Int,
    val commentCount: Int,
    val noticeCount: Int
)

/**
 * 최근 활동 응답 DTO
 */
data class RecentActivityResponse(
    val type: String, // ADMIN_CREATED, POST_CREATED, NOTICE_CREATED, etc.
    val description: String,
    val timestamp: LocalDateTime
)

/**
 * 종합 대시보드 응답 DTO
 */
data class ComprehensiveDashboardResponse(
    val overview: SystemOverviewResponse,
    val subdomainStats: List<SubdomainStatsResponse>,
    val recentActivities: List<RecentActivityResponse>
)