package io.be.admin.presentation

import io.be.team.dto.TeamDto
import io.be.team.application.TeamService
import io.be.player.application.PlayerService
import io.be.stadium.application.StadiumService
import io.be.shared.util.ApiResponse
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v1/admin/tenants")
@CrossOrigin(origins = ["*"])
class TenantController(
    private val teamService: TeamService,
    private val playerService: PlayerService,
    private val stadiumService: StadiumService
) {
    
    @GetMapping
    fun getAllTenants(): ApiResponse<List<Map<String, Any>>> {
        val allTeamsStats = teamService.getAllTeamsStats()
        @Suppress("UNCHECKED_CAST")
        val teamsData = allTeamsStats["teams"] as List<Map<String, Any>>
        val tenants = teamsData.map { team ->
            mapOf(
                "id" to team["id"],
                "name" to team["name"],
                "code" to team["code"],
                "playerCount" to team["playerCount"],
                "stadiumCount" to team["stadiumCount"],
                "url" to "${team["code"]}.localhost:3000",
                "status" to "active"
            ) as Map<String, Any>
        }
        
        return ApiResponse.success(tenants)
    }
    
    @GetMapping("/{teamCode}")
    fun getTenantByCode(@PathVariable teamCode: String): ApiResponse<Map<String, Any>> {
        val team = teamService.findTeamByCode(teamCode)
            ?: return ApiResponse.error("TEAM_NOT_FOUND", "팀을 찾을 수 없습니다.")
            
        val stats = teamService.getTeamStats(team.id)
        
        val tenantInfo = mapOf(
            "team" to team,
            "stats" to stats,
            "url" to "${team.code}.localhost:3000",
            "status" to "active"
        )
        
        return ApiResponse.success(tenantInfo)
    }
    
    @GetMapping("/{teamCode}/dashboard")
    fun getTenantDashboard(@PathVariable teamCode: String): ApiResponse<Map<String, Any>> {
        val team = teamService.findTeamByCode(teamCode)
            ?: return ApiResponse.error("TEAM_NOT_FOUND", "팀을 찾을 수 없습니다.")
            
        val stats = teamService.getTeamStats(team.id)
        val players = playerService.findActivePlayersByTeam(team.id)
        val stadiums = stadiumService.findStadiumsByTeam(team.id)
        
        val dashboard = mapOf(
            "team" to team,
            "stats" to stats,
            "recentPlayers" to players.take(5),
            "recentStadiums" to stadiums.take(3),
            "url" to "${team.code}.localhost:3000"
        )
        
        return ApiResponse.success(dashboard)
    }
    
    @GetMapping("/{teamCode}/players")
    fun getTenantPlayers(
        @PathVariable teamCode: String,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int
    ): ApiResponse<Map<String, Any>> {
        val team = teamService.findTeamByCode(teamCode)
            ?: return ApiResponse.error("TEAM_NOT_FOUND", "팀을 찾을 수 없습니다.")
            
        val players = playerService.findActivePlayersByTeam(team.id)
        
        val result = mapOf(
            "team" to team,
            "players" to players,
            "url" to "${team.code}.localhost:3000"
        )
        
        return ApiResponse.success(result)
    }
    
    @GetMapping("/{teamCode}/stadiums")
    fun getTenantStadiums(
        @PathVariable teamCode: String,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int
    ): ApiResponse<Map<String, Any>> {
        val team = teamService.findTeamByCode(teamCode)
            ?: return ApiResponse.error("TEAM_NOT_FOUND", "팀을 찾을 수 없습니다.")
            
        val stadiums = stadiumService.findStadiumsByTeam(team.id)
        
        val result = mapOf(
            "team" to team,
            "stadiums" to stadiums,
            "url" to "${team.code}.localhost:3000"
        )
        
        return ApiResponse.success(result)
    }
    
    @PutMapping("/{teamCode}/settings")
    fun updateTenantSettings(
        @PathVariable teamCode: String,
        @RequestBody settings: Map<String, Any>
    ): ApiResponse<String> {
        // TODO: 테넌트 설정 업데이트 로직 구현
        return ApiResponse.success("Settings updated successfully")
    }
    
    @PostMapping
    fun createTenant(@RequestBody request: Map<String, Any>): ApiResponse<String> {
        // TODO: 새 테넌트 생성 로직 구현
        return ApiResponse.success("Tenant created successfully")
    }
}