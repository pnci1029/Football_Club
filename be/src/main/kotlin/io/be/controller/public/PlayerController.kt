package io.be.controller.public

import io.be.dto.PlayerDto
import io.be.service.PlayerService
import io.be.service.SubdomainService
import io.be.util.ApiResponse
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v1/players")
@CrossOrigin(origins = ["*"])
class PlayerController(
    private val playerService: PlayerService,
    private val subdomainService: SubdomainService
) {
    
    @GetMapping
    fun getPlayers(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int,
        @RequestHeader("Host") host: String
    ): ResponseEntity<ApiResponse<Page<PlayerDto>>> {
        val team = subdomainService.getTeamBySubdomain(host)
            ?: return ResponseEntity.badRequest()
                .body(ApiResponse.error("TEAM_NOT_FOUND", "팀을 찾을 수 없습니다"))
        
        val players = playerService.findPlayersByTeam(team.id, PageRequest.of(page, size))
        return ResponseEntity.ok(ApiResponse.success(players))
    }
    
    @GetMapping("/{id}")
    fun getPlayer(
        @PathVariable id: Long,
        @RequestHeader("Host") host: String
    ): ResponseEntity<ApiResponse<PlayerDto>> {
        val team = subdomainService.getTeamBySubdomain(host)
            ?: return ResponseEntity.badRequest()
                .body(ApiResponse.error("TEAM_NOT_FOUND", "팀을 찾을 수 없습니다"))
        
        val player = playerService.findPlayerById(id)
            ?: return ResponseEntity.notFound().build()
            
        // 요청한 팀의 선수인지 확인
        if (player.teamId != team.id) {
            return ResponseEntity.notFound().build()
        }
        
        return ResponseEntity.ok(ApiResponse.success(player))
    }
    
    @GetMapping("/active")
    fun getActivePlayers(
        @RequestHeader("Host") host: String
    ): ResponseEntity<ApiResponse<List<PlayerDto>>> {
        val team = subdomainService.getTeamBySubdomain(host)
            ?: return ResponseEntity.badRequest()
                .body(ApiResponse.error("TEAM_NOT_FOUND", "팀을 찾을 수 없습니다"))
        
        val players = playerService.findActivePlayersByTeam(team.id)
        return ResponseEntity.ok(ApiResponse.success(players))
    }
}