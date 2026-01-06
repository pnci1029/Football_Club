package io.be.admin.presentation

import io.be.admin.dto.AdminInfo
import io.be.admin.domain.AdminLevel
import io.be.player.dto.CreatePlayerRequest
import io.be.player.dto.PlayerDto
import io.be.player.dto.UpdatePlayerRequest
import io.be.shared.exception.PlayerNotFoundException
import io.be.shared.exception.MissingRequiredFieldException
import io.be.shared.exception.UnauthorizedAdminAccessException
import io.be.player.application.PlayerService
import io.be.shared.security.AdminPermissionRequired
import io.be.shared.util.AdminSecurityUtils
import io.be.shared.util.PagedResponse
import io.be.shared.util.PageMetadata
import io.be.team.application.TeamService
import jakarta.validation.Valid
import org.springframework.data.domain.PageRequest
import org.springframework.http.HttpStatus
import io.be.shared.util.ApiResponse
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
        @RequestAttribute("adminInfo") adminInfo: AdminInfo,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int,
        @RequestParam(required = false) teamId: Long?,
        @RequestParam(required = false) position: String?,
        @RequestParam(required = false) search: String?
    ): ApiResponse<PagedResponse<PlayerDto>> {
        // 권한별 teamId 결정
        val actualTeamId = AdminSecurityUtils.getAuthorizedTeamId(adminInfo, teamId, teamService)

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
        return ApiResponse.success(pagedResponse)
    }

    @AdminPermissionRequired(level = AdminLevel.SUBDOMAIN)
    @PostMapping
    fun createPlayer(
        adminInfo: AdminInfo,
        @Valid @RequestBody request: CreatePlayerRequest,
        @RequestParam teamId: Long
    ): ApiResponse<PlayerDto> {
        // 권한 검증
        AdminSecurityUtils.validateSubdomainAccess(adminInfo, teamId, teamService)

        val player = playerService.createPlayer(teamId, request)
        return ApiResponse.success(player)
    }

    @AdminPermissionRequired(level = AdminLevel.SUBDOMAIN)
    @GetMapping("/{id}")
    fun getPlayer(
        adminInfo: AdminInfo,
        @PathVariable id: Long
    ): ApiResponse<PlayerDto> {
        val player = playerService.findPlayerById(id)
            ?: throw PlayerNotFoundException(id)

        // 권한 검증
        AdminSecurityUtils.validateSubdomainAccess(adminInfo, player.teamId, teamService)

        return ApiResponse.success(player)
    }

    @AdminPermissionRequired(level = AdminLevel.SUBDOMAIN)
    @PutMapping("/{id}")
    fun updatePlayer(
        adminInfo: AdminInfo,
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdatePlayerRequest
    ): ApiResponse<PlayerDto> {
        val existingPlayer = playerService.findPlayerById(id)
            ?: throw PlayerNotFoundException(id)

        // 권한 검증
        AdminSecurityUtils.validateSubdomainAccess(adminInfo, existingPlayer.teamId, teamService)

        val updatedPlayer = playerService.updatePlayer(id, request)
        return ApiResponse.success(updatedPlayer)
    }

    @AdminPermissionRequired(level = AdminLevel.SUBDOMAIN)
    @DeleteMapping("/{id}")
    fun deletePlayer(
        @RequestAttribute("adminInfo") adminInfo: AdminInfo,
        @PathVariable id: Long
    ): ApiResponse<String> {
        val existingPlayer = playerService.findPlayerById(id)
            ?: throw PlayerNotFoundException(id)

        // 권한 검증
        AdminSecurityUtils.validateSubdomainAccess(adminInfo, existingPlayer.teamId, teamService)

        playerService.deletePlayer(id)
        return ApiResponse.success("deleted")
    }
}
