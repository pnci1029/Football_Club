package io.be.admin.application

import io.be.admin.domain.AdminLevel
import io.be.admin.domain.AdminRepository
import io.be.community.domain.CommunityPostRepository
import io.be.community.domain.CommunityCommentRepository
import io.be.notice.domain.NoticeRepository
import io.be.team.application.TeamService
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

/**
 * 마스터 관리자 전용: 전체 시스템 통계 및 대시보드 서비스
 */
@Service
@Transactional(readOnly = true)
class MasterDashboardService(
    private val teamService: TeamService,
    private val adminRepository: AdminRepository,
    private val communityPostRepository: CommunityPostRepository,
    private val communityCommentRepository: CommunityCommentRepository,
    private val noticeRepository: NoticeRepository
) {
    
    /**
     * 전체 시스템 통계 조회
     */
    fun getSystemOverview(): SystemOverviewResponse {
        
        // 팀 관련 통계
        val teamStats = teamService.getAllTeamsStats()
        
        // 관리자 통계
        val totalAdmins = adminRepository.countByIsActive(true)
        val masterAdmins = adminRepository.findByAdminLevelAndIsActiveOrderByCreatedAtDesc(AdminLevel.MASTER, true).size
        val subdomainAdmins = totalAdmins - masterAdmins
        
        // 커뮤니티 통계
        val totalPosts = communityPostRepository.countByIsActive(true)
        val totalComments = communityCommentRepository.countByIsActive(true)
        
        // 공지사항 통계
        val totalNotices = noticeRepository.countByIsDeletedFalse()
        
        // 최근 활동 통계 (30일 기준)
        val thirtyDaysAgo = LocalDateTime.now().minusDays(30)
        val recentPosts = communityPostRepository.countByIsActiveAndCreatedAtAfter(true, thirtyDaysAgo)
        val recentNotices = noticeRepository.countByIsDeletedFalseAndCreatedAtAfter(thirtyDaysAgo)
        
        return SystemOverviewResponse(
            // 팀 통계
            totalTeams = teamStats["totalTeams"] as Int,
            totalPlayers = (teamStats["totalPlayers"] as Long).toInt(),
            totalStadiums = (teamStats["totalStadiums"] as Long).toInt(),
            totalMatches = teamStats["totalMatches"] as Int,
            
            // 관리자 통계
            totalAdmins = totalAdmins.toInt(),
            masterAdmins = masterAdmins,
            subdomainAdmins = subdomainAdmins.toInt(),
            
            // 콘텐츠 통계
            totalPosts = totalPosts.toInt(),
            totalComments = totalComments.toInt(),
            totalNotices = totalNotices.toInt(),
            
            // 최근 활동
            recentPosts = recentPosts.toInt(),
            recentNotices = recentNotices.toInt()
        )
    }
    
    /**
     * 서브도메인별 상세 통계 조회
     */
    fun getSubdomainStats(): List<SubdomainStatsResponse> {
        val teamStats = teamService.getAllTeamsStats()
        val teams = teamStats["teams"] as List<Map<String, Any>>
        
        return teams.map { team ->
            val teamCode = team["code"] as String
            val teamId = team["id"] as Long
            
            // 해당 서브도메인의 관리자 수
            val subdomainAdmins = adminRepository.findByTeamSubdomainAndIsActiveOrderByCreatedAtDesc(teamCode, true).size
            
            // 해당 팀의 커뮤니티 활동 (teamId 기준)
            val teamPosts = communityPostRepository.countByTeamIdAndIsActive(teamId, true)
            val teamComments = communityCommentRepository.countByTeamIdAndIsActive(teamId, true)
            
            // 해당 팀의 공지사항
            val teamNotices = noticeRepository.countByTeamIdAndIsDeletedFalse(teamId)
            
            SubdomainStatsResponse(
                teamCode = teamCode,
                teamName = team["name"] as String,
                teamId = teamId,
                playerCount = team["playerCount"] as Int,
                stadiumCount = team["stadiumCount"] as Int,
                adminCount = subdomainAdmins,
                postCount = teamPosts.toInt(),
                commentCount = teamComments.toInt(),
                noticeCount = teamNotices.toInt()
            )
        }
    }
    
    /**
     * 최근 활동 로그 조회
     */
    fun getRecentActivities(): List<RecentActivityResponse> {
        val activities = mutableListOf<RecentActivityResponse>()
        
        // 최근 생성된 관리자들
        val recentAdmins = adminRepository.findByIsActiveOrderByCreatedAtDesc(true)
            .take(5)
            .map { admin ->
                RecentActivityResponse(
                    type = "ADMIN_CREATED",
                    description = "새 관리자 생성: ${admin.username} (${admin.teamSubdomain ?: "마스터"})",
                    timestamp = admin.createdAt
                )
            }
        
        // 최근 커뮤니티 게시글
        val recentPosts = communityPostRepository.findByIsActiveOrderByCreatedAtDesc(true)
            .take(5)
            .map { post ->
                RecentActivityResponse(
                    type = "POST_CREATED",
                    description = "새 게시글: ${post.title}",
                    timestamp = post.createdAt
                )
            }
        
        // 최근 공지사항
        val recentNotices = noticeRepository.findByIsDeletedFalseOrderByCreatedAtDesc()
            .take(5)
            .map { notice ->
                RecentActivityResponse(
                    type = "NOTICE_CREATED", 
                    description = "새 공지사항: ${notice.title}",
                    timestamp = notice.createdAt
                )
            }
        
        activities.addAll(recentAdmins)
        activities.addAll(recentPosts)
        activities.addAll(recentNotices)
        
        // 시간순 정렬 후 최근 10개만 반환
        return activities.sortedByDescending { it.timestamp }.take(10)
    }
}

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