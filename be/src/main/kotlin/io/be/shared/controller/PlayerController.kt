package io.be.shared.controller

import io.be.player.dto.PlayerDto
import io.be.team.dto.TeamDto
import io.be.shared.exception.TeamNotFoundException
import io.be.shared.exception.PlayerNotFoundException
import io.be.player.application.PlayerService
import io.be.shared.util.ApiResponse
import io.be.shared.util.PagedResponse
import io.be.shared.util.PageMetadata
import org.springframework.data.domain.PageRequest
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v1/players")
@CrossOrigin(origins = ["*"])
class PlayerController(
    private val playerService: PlayerService
) {
    
    @GetMapping
    fun getPlayers(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int,
        @RequestParam(required = false) position: String?,
        @RequestParam(required = false) search: String?,
        @RequestAttribute("team", required = false) team: TeamDto?
    ): ResponseEntity<ApiResponse<PagedResponse<PlayerDto>>> {
        team ?: throw TeamNotFoundException("Team not found for subdomain")
        
        val players = playerService.findPlayersByTeam(team.id, PageRequest.of(page, size))
        
        val filters = mutableMapOf<String, Any>()
        position?.let { filters["position"] = it }
        search?.let { filters["search"] = it }
        
        val metadata = PageMetadata(
            filters = filters.takeIf { it.isNotEmpty() },
            teamId = team.id,
            additionalInfo = mapOf("teamName" to team.name)
        )
        
        val pagedResponse = PagedResponse.of(players, metadata)
        return ResponseEntity.ok(ApiResponse.success(pagedResponse))
    }
    
    @GetMapping("/{id}")
    fun getPlayer(
        @PathVariable id: Long,
        @RequestAttribute("team", required = false) team: TeamDto?
    ): ResponseEntity<ApiResponse<PlayerDto>> {
        team ?: throw TeamNotFoundException("Team not found for subdomain")
        
        val player = playerService.findPlayerById(id)
            ?: throw PlayerNotFoundException(id)
            
        // 요청한 팀의 선수인지 확인 (보안)
        if (player.teamId != team.id) {
            throw PlayerNotFoundException(id) // 보안상 404로 처리
        }
        
        return ResponseEntity.ok(ApiResponse.success(player))
    }
    
    @GetMapping("/active")
    fun getActivePlayers(
        @RequestAttribute("team", required = false) team: TeamDto?
    ): ResponseEntity<ApiResponse<List<PlayerDto>>> {
        team ?: throw TeamNotFoundException("Team not found for subdomain")
        
        val players = playerService.findActivePlayersByTeam(team.id)
        return ResponseEntity.ok(ApiResponse.success(players, "Active players retrieved successfully"))
    }
}