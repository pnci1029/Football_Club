package io.be.controller.admin

import io.be.dto.TeamDto
import io.be.service.TeamService
import io.be.service.PlayerService
import io.be.service.StadiumService
import io.be.util.ApiResponse
import org.springframework.http.ResponseEntity
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
    fun getAllTenants(): ResponseEntity<ApiResponse<List<Map<String, Any>>>> {
        val allTeamsStats = teamService.getAllTeamsStats()
        val tenants = (allTeamsStats["teams"] as List<Map<String, Any>>).map { team ->
            mapOf(
                "id" to team["id"],
                "name" to team["name"],
                "code" to team["code"],
                "playerCount" to team["playerCount"],
                "stadiumCount" to team["stadiumCount"],
                "url" to "${team["code"]}.localhost:3000",
                "status" to "active"
            )
        }
        
        return ResponseEntity.ok(ApiResponse.success(tenants as List<Map<String, Any>>))
    }
    
    @GetMapping("/{teamCode}")
    fun getTenantByCode(@PathVariable teamCode: String): ResponseEntity<ApiResponse<Map<String, Any>>> {
        val team = teamService.findTeamByCode(teamCode)
            ?: return ResponseEntity.notFound().build()
            
        val stats = teamService.getTeamStats(team.id)
        
        val tenantInfo = mapOf(
            "team" to team,
            "stats" to stats,
            "url" to "${team.code}.localhost:3000",
            "status" to "active"
        )
        
        return ResponseEntity.ok(ApiResponse.success(tenantInfo))
    }
    
    @GetMapping("/{teamCode}/dashboard")
    fun getTenantDashboard(@PathVariable teamCode: String): ResponseEntity<ApiResponse<Map<String, Any>>> {
        val team = teamService.findTeamByCode(teamCode)
            ?: return ResponseEntity.notFound().build()
            
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
        
        return ResponseEntity.ok(ApiResponse.success(dashboard))
    }
    
    @GetMapping("/{teamCode}/players")
    fun getTenantPlayers(
        @PathVariable teamCode: String,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int
    ): ResponseEntity<ApiResponse<Map<String, Any>>> {
        val team = teamService.findTeamByCode(teamCode)
            ?: return ResponseEntity.notFound().build()
            
        val players = playerService.findActivePlayersByTeam(team.id)
        
        val result = mapOf(
            "team" to team,
            "players" to players,
            "url" to "${team.code}.localhost:3000"
        )
        
        return ResponseEntity.ok(ApiResponse.success(result))
    }
    
    @GetMapping("/{teamCode}/stadiums")
    fun getTenantStadiums(
        @PathVariable teamCode: String,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int
    ): ResponseEntity<ApiResponse<Map<String, Any>>> {
        val team = teamService.findTeamByCode(teamCode)
            ?: return ResponseEntity.notFound().build()
            
        val stadiums = stadiumService.findStadiumsByTeam(team.id)
        
        val result = mapOf(
            "team" to team,
            "stadiums" to stadiums,
            "url" to "${team.code}.localhost:3000"
        )
        
        return ResponseEntity.ok(ApiResponse.success(result))
    }
    
    @PutMapping("/{teamCode}/settings")
    fun updateTenantSettings(
        @PathVariable teamCode: String,
        @RequestBody settings: Map<String, Any>
    ): ResponseEntity<ApiResponse<String>> {
        // TODO: 테넌트 설정 업데이트 로직 구현
        return ResponseEntity.ok(ApiResponse.success("Settings updated successfully"))
    }
    
    @PostMapping
    fun createTenant(@RequestBody request: Map<String, Any>): ResponseEntity<ApiResponse<String>> {
        // TODO: 새 테넌트 생성 로직 구현
        return ResponseEntity.ok(ApiResponse.success("Tenant created successfully"))
    }
}