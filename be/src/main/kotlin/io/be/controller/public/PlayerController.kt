package io.be.controller.public

import io.be.dto.PlayerDto
import io.be.exception.TeamNotFoundException
import io.be.exception.PlayerNotFoundException
import io.be.service.PlayerService
import io.be.service.SubdomainService
import io.be.util.ApiResponse
import io.be.util.PagedResponse
import io.be.util.PageMetadata
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
    
    private fun extractTeamFromHost(host: String): String? {
        if (host.contains("localhost")) {
            val parts = host.split(".")
            if (parts.size > 1 && parts[0] != "localhost" && parts[0].isNotEmpty()) {
                return parts[0]
            }
        }
        return null
    }
    
    @GetMapping
    fun getPlayers(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int,
        @RequestParam(required = false) position: String?,
        @RequestParam(required = false) search: String?,
        @RequestHeader("X-Forwarded-Host", required = false) forwardedHost: String?,
        @RequestHeader("Host", required = false) host: String?
    ): ResponseEntity<ApiResponse<PagedResponse<PlayerDto>>> {
        val actualHost = forwardedHost ?: host ?: ""
        val teamCode = extractTeamFromHost(actualHost)
        val team = teamCode?.let { subdomainService.getTeamByCode(it) }
            ?: throw TeamNotFoundException(actualHost)
        
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
        @RequestHeader("Host") host: String
    ): ResponseEntity<ApiResponse<PlayerDto>> {
        val team = subdomainService.getTeamBySubdomain(host)
            ?: throw TeamNotFoundException(host)
        
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
        @RequestHeader("Host") host: String
    ): ResponseEntity<ApiResponse<List<PlayerDto>>> {
        val team = subdomainService.getTeamBySubdomain(host)
            ?: throw TeamNotFoundException(host)
        
        val players = playerService.findActivePlayersByTeam(team.id)
        return ResponseEntity.ok(ApiResponse.success(players, "Active players retrieved successfully"))
    }
}