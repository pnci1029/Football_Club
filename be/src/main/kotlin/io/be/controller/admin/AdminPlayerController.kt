package io.be.controller.admin

import io.be.dto.CreatePlayerRequest
import io.be.dto.PlayerDto
import io.be.dto.UpdatePlayerRequest
import io.be.service.PlayerService
import io.be.util.ApiResponse
import jakarta.validation.Valid
import org.springframework.data.domain.Page
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
        @RequestParam(required = false) teamId: Long?
    ): ResponseEntity<ApiResponse<Page<PlayerDto>>> {
        val players = if (teamId != null) {
            playerService.findPlayersByTeam(teamId, PageRequest.of(page, size))
        } else {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("TEAM_ID_REQUIRED", "Team ID is required"))
        }
        
        return ResponseEntity.ok(ApiResponse.success(players))
    }
    
    @PostMapping
    fun createPlayer(
        @Valid @RequestBody request: CreatePlayerRequest,
        @RequestParam teamId: Long
    ): ResponseEntity<ApiResponse<PlayerDto>> {
        val player = playerService.createPlayer(teamId, request)
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(player))
    }
    
    @GetMapping("/{id}")
    fun getPlayer(@PathVariable id: Long): ResponseEntity<ApiResponse<PlayerDto>> {
        val player = playerService.findPlayerById(id)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(ApiResponse.success(player))
    }
    
    @PutMapping("/{id}")
    fun updatePlayer(
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdatePlayerRequest
    ): ResponseEntity<ApiResponse<PlayerDto>> {
        val updatedPlayer = playerService.updatePlayer(id, request)
        return ResponseEntity.ok(ApiResponse.success(updatedPlayer))
    }
    
    @DeleteMapping("/{id}")
    fun deletePlayer(@PathVariable id: Long): ResponseEntity<ApiResponse<String>> {
        playerService.deletePlayer(id)
        return ResponseEntity.ok(ApiResponse.success("Player deleted successfully"))
    }
}