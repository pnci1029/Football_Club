package io.be.admin.presentation

import io.be.admin.application.AdminInfo
import io.be.admin.domain.AdminLevel
import io.be.player.dto.CreatePlayerRequest
import io.be.player.dto.PlayerDto
import io.be.player.dto.UpdatePlayerRequest
import io.be.shared.exception.PlayerNotFoundException
import io.be.shared.exception.MissingRequiredFieldException
import io.be.shared.exception.UnauthorizedAdminAccessException
import io.be.player.application.PlayerService
import io.be.shared.security.AdminPermissionRequired
import io.be.shared.util.ApiResponse
import io.be.shared.util.PagedResponse
import io.be.shared.util.PageMetadata
import io.be.team.application.TeamService
import jakarta.validation.Valid
import org.springframework.data.domain.PageRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v1/admin/players")
@CrossOrigin(origins = ["*"])
class AdminPlayerController(
    private val playerService: PlayerService,
    private val teamService: TeamService
) {
    
    @AdminPermissionRequired(level = AdminLevel.SUBDOMAIN)
    @GetMapping
    fun getAllPlayers(
        adminInfo: AdminInfo,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int,
        @RequestParam(required = false) teamId: Long?,
        @RequestParam(required = false) position: String?,
        @RequestParam(required = false) search: String?
    ): ResponseEntity<ApiResponse<PagedResponse<PlayerDto>>> {
        // 권한별 teamId 결정
        val actualTeamId = when (adminInfo.adminLevel) {
            AdminLevel.MASTER -> {
                // 마스터는 teamId 파라미터 필수
                teamId ?: throw MissingRequiredFieldException("teamId")
            }
            AdminLevel.SUBDOMAIN -> {
                // 서브도메인 관리자는 자신의 팀으로 제한
                val team = teamService.findByCode(adminInfo.teamSubdomain!!)
                    ?: throw UnauthorizedAdminAccessException("Invalid team subdomain")
                
                // 요청한 teamId가 있다면 자신의 팀인지 검증
                if (teamId != null && teamId != team.id) {
                    throw UnauthorizedAdminAccessException("Subdomain admin can only access their own team")
                }
                team.id
            }
        }
        
        val players = if (!search.isNullOrBlank()) {
            playerService.findPlayersByTeamWithSearch(actualTeamId, search, PageRequest.of(page, size))
        } else {
            playerService.findPlayersByTeam(actualTeamId, PageRequest.of(page, size))
        }
        
        val filters = mutableMapOf<String, Any>()
        filters["teamId"] = actualTeamId
        position?.let { filters["position"] = it }
        search?.let { filters["search"] = it }
        
        val metadata = PageMetadata(
            filters = filters.takeIf { it.isNotEmpty() },
            teamId = actualTeamId,
            additionalInfo = mapOf(
                "context" to "admin",
                "adminLevel" to adminInfo.adminLevel.name
            )
        )
        
        val pagedResponse = PagedResponse.of(players, metadata)
        return ResponseEntity.ok(ApiResponse.success(pagedResponse, "Players retrieved successfully"))
    }
    
    @AdminPermissionRequired(level = AdminLevel.SUBDOMAIN)
    @PostMapping
    fun createPlayer(
        adminInfo: AdminInfo,
        @Valid @RequestBody request: CreatePlayerRequest,
        @RequestParam teamId: Long
    ): ResponseEntity<ApiResponse<PlayerDto>> {
        // 서브도메인 관리자는 자신의 팀에만 선수 생성 가능
        if (adminInfo.adminLevel == AdminLevel.SUBDOMAIN) {
            val team = teamService.findByCode(adminInfo.teamSubdomain!!)
                ?: throw UnauthorizedAdminAccessException("Invalid team subdomain")
            
            if (teamId != team.id) {
                throw UnauthorizedAdminAccessException("Subdomain admin can only create players for their own team")
            }
        }
        
        val player = playerService.createPlayer(teamId, request)
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(player, "Player created successfully"))
    }
    
    @AdminPermissionRequired(level = AdminLevel.SUBDOMAIN)
    @GetMapping("/{id}")
    fun getPlayer(
        adminInfo: AdminInfo,
        @PathVariable id: Long
    ): ResponseEntity<ApiResponse<PlayerDto>> {
        val player = playerService.findPlayerById(id)
            ?: throw PlayerNotFoundException(id)
            
        // 서브도메인 관리자는 자신의 팀 선수만 조회 가능
        if (adminInfo.adminLevel == AdminLevel.SUBDOMAIN) {
            val team = teamService.findByCode(adminInfo.teamSubdomain!!)
                ?: throw UnauthorizedAdminAccessException("Invalid team subdomain")
            
            if (player.teamId != team.id) {
                throw UnauthorizedAdminAccessException("Subdomain admin can only access players from their own team")
            }
        }
        
        return ResponseEntity.ok(ApiResponse.success(player))
    }
    
    @AdminPermissionRequired(level = AdminLevel.SUBDOMAIN)
    @PutMapping("/{id}")
    fun updatePlayer(
        adminInfo: AdminInfo,
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdatePlayerRequest
    ): ResponseEntity<ApiResponse<PlayerDto>> {
        val existingPlayer = playerService.findPlayerById(id)
            ?: throw PlayerNotFoundException(id)
            
        // 서브도메인 관리자는 자신의 팀 선수만 수정 가능
        if (adminInfo.adminLevel == AdminLevel.SUBDOMAIN) {
            val team = teamService.findByCode(adminInfo.teamSubdomain!!)
                ?: throw UnauthorizedAdminAccessException("Invalid team subdomain")
            
            if (existingPlayer.teamId != team.id) {
                throw UnauthorizedAdminAccessException("Subdomain admin can only update players from their own team")
            }
        }
        
        val updatedPlayer = playerService.updatePlayer(id, request)
        return ResponseEntity.ok(ApiResponse.success(updatedPlayer, "Player updated successfully"))
    }
    
    @AdminPermissionRequired(level = AdminLevel.SUBDOMAIN)
    @DeleteMapping("/{id}")
    fun deletePlayer(
        adminInfo: AdminInfo,
        @PathVariable id: Long
    ): ResponseEntity<ApiResponse<String>> {
        val existingPlayer = playerService.findPlayerById(id)
            ?: throw PlayerNotFoundException(id)
            
        // 서브도메인 관리자는 자신의 팀 선수만 삭제 가능
        if (adminInfo.adminLevel == AdminLevel.SUBDOMAIN) {
            val team = teamService.findByCode(adminInfo.teamSubdomain!!)
                ?: throw UnauthorizedAdminAccessException("Invalid team subdomain")
            
            if (existingPlayer.teamId != team.id) {
                throw UnauthorizedAdminAccessException("Subdomain admin can only delete players from their own team")
            }
        }
        
        playerService.deletePlayer(id)
        return ResponseEntity.ok(ApiResponse.success("deleted", "Player deleted successfully"))
    }
}