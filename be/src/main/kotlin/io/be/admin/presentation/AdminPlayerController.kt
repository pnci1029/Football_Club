package io.be.admin.presentation

import io.be.player.dto.CreatePlayerRequest
import io.be.player.dto.PlayerDto
import io.be.player.dto.UpdatePlayerRequest
import io.be.shared.exception.PlayerNotFoundException
import io.be.shared.exception.MissingRequiredFieldException
import io.be.player.application.PlayerService
import io.be.shared.util.ApiResponse
import io.be.shared.util.PagedResponse
import io.be.shared.util.PageMetadata
import jakarta.validation.Valid
import org.springframework.data.domain.PageRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v1/admin/players")
@CrossOrigin(origins = ["*"])
class AdminPlayerController(
    private val playerService: PlayerService
) {
    
    @GetMapping
    fun getAllPlayers(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int,
        @RequestParam(required = false) teamId: Long?,
        @RequestParam(required = false) position: String?,
        @RequestParam(required = false) search: String?
    ): ResponseEntity<ApiResponse<PagedResponse<PlayerDto>>> {
        val actualTeamId = teamId ?: throw MissingRequiredFieldException("teamId")
        
        val players = if (!search.isNullOrBlank()) {
            playerService.findPlayersByTeamWithSearch(actualTeamId, search, PageRequest.of(page, size))
        } else {
            playerService.findPlayersByTeam(actualTeamId, PageRequest.of(page, size))
        }
        
        val filters = mutableMapOf<String, Any>()
        teamId?.let { filters["teamId"] = it }
        position?.let { filters["position"] = it }
        search?.let { filters["search"] = it }
        
        val metadata = PageMetadata(
            filters = filters.takeIf { it.isNotEmpty() },
            teamId = actualTeamId,
            additionalInfo = mapOf("context" to "admin")
        )
        
        val pagedResponse = PagedResponse.of(players, metadata)
        return ResponseEntity.ok(ApiResponse.success(pagedResponse, "Players retrieved successfully"))
    }
    
    @PostMapping
    fun createPlayer(
        @Valid @RequestBody request: CreatePlayerRequest,
        @RequestParam teamId: Long
    ): ResponseEntity<ApiResponse<PlayerDto>> {
        val player = playerService.createPlayer(teamId, request)
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(player, "Player created successfully"))
    }
    
    @GetMapping("/{id}")
    fun getPlayer(@PathVariable id: Long): ResponseEntity<ApiResponse<PlayerDto>> {
        val player = playerService.findPlayerById(id)
            ?: throw PlayerNotFoundException(id)
        return ResponseEntity.ok(ApiResponse.success(player))
    }
    
    @PutMapping("/{id}")
    fun updatePlayer(
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdatePlayerRequest
    ): ResponseEntity<ApiResponse<PlayerDto>> {
        val updatedPlayer = playerService.updatePlayer(id, request)
        return ResponseEntity.ok(ApiResponse.success(updatedPlayer, "Player updated successfully"))
    }
    
    @DeleteMapping("/{id}")
    fun deletePlayer(@PathVariable id: Long): ResponseEntity<ApiResponse<String>> {
        playerService.deletePlayer(id)
        return ResponseEntity.ok(ApiResponse.success("deleted", "Player deleted successfully"))
    }
}