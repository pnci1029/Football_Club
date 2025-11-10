
package io.be.admin.presentation

import io.be.admin.domain.AdminLevel
import io.be.admin.dto.AdminInfo
import io.be.match.application.MatchService
import io.be.match.domain.MatchStatus
import io.be.match.dto.CreateMatchRequest
import io.be.match.dto.MatchDto
import io.be.match.dto.MatchScoreRequest
import io.be.match.dto.UpdateMatchRequest
import io.be.shared.exception.MatchNotFoundException
import io.be.shared.exception.MissingRequiredFieldException
import io.be.shared.exception.UnauthorizedAdminAccessException
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
@RequestMapping("/v1/admin/matches")
@CrossOrigin(origins = ["*"])
class AdminMatchController(
    private val matchService: MatchService,
    private val teamService: TeamService,
) {

    @AdminPermissionRequired(level = AdminLevel.SUBDOMAIN)
    @GetMapping
    fun getAllMatches(
        @RequestAttribute("adminInfo") adminInfo: AdminInfo,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int,
        @RequestParam(required = false) teamId: Long?,
        @RequestParam(required = false) stadiumId: Long?,
        @RequestParam(required = false) status: MatchStatus?
    ): ResponseEntity<ApiResponse<PagedResponse<MatchDto>>> {
        val pageable = PageRequest.of(page, size)

        val matches = when (adminInfo.adminLevel) {
            AdminLevel.MASTER -> {
                when {
                    teamId != null && status != null -> matchService.findMatchesByTeamAndStatus(teamId, status, pageable)
                    teamId != null -> matchService.findMatchesByTeam(teamId, pageable)
                    stadiumId != null -> matchService.findMatchesByStadium(stadiumId, pageable)
                    status != null -> matchService.findMatchesByStatus(status, pageable)
                    else -> matchService.findAllMatches(pageable)
                }
            }
            AdminLevel.SUBDOMAIN -> {
                val team = teamService.findByCode(adminInfo.teamSubdomain!!)
                    ?: throw UnauthorizedAdminAccessException("Invalid team subdomain")
                val currentTeamId = team.id

                if (teamId != null && teamId != currentTeamId) {
                    throw UnauthorizedAdminAccessException("Subdomain admin can only access their own team's matches")
                }

                if (status != null) {
                    matchService.findMatchesByTeamAndStatus(currentTeamId, status, pageable)
                } else {
                    matchService.findMatchesByTeam(currentTeamId, pageable)
                }
            }
        }

        val pagedResponse = PagedResponse.of(matches)
        return ResponseEntity.ok(ApiResponse.success(pagedResponse, "Matches retrieved successfully"))
    }

    @AdminPermissionRequired(level = AdminLevel.SUBDOMAIN)
    @GetMapping("/{id}")
    fun getMatch(
        @RequestAttribute("adminInfo") adminInfo: AdminInfo,
        @PathVariable id: Long
    ): ResponseEntity<ApiResponse<MatchDto>> {
        val match = matchService.findMatchById(id)
            ?: throw MatchNotFoundException(id)

        if (adminInfo.adminLevel == AdminLevel.SUBDOMAIN) {
            val team = teamService.findByCode(adminInfo.teamSubdomain!!)
                ?: throw UnauthorizedAdminAccessException("Invalid team subdomain")
            if (match.homeTeam.id != team.id && match.awayTeam.id != team.id) {
                throw UnauthorizedAdminAccessException("Subdomain admin can only access their own team's matches")
            }
        }

        return ResponseEntity.ok(ApiResponse.success(match))
    }

    @AdminPermissionRequired(level = AdminLevel.MASTER)
    @PostMapping
    fun createMatch(
        @Valid @RequestBody request: CreateMatchRequest
    ): ResponseEntity<ApiResponse<MatchDto>> {
        val match = matchService.createMatch(request)
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(match, "Match created successfully"))
    }

    @AdminPermissionRequired(level = AdminLevel.MASTER)
    @PutMapping("/{id}")
    fun updateMatch(
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdateMatchRequest
    ): ResponseEntity<ApiResponse<MatchDto>> {
        val updatedMatch = matchService.updateMatch(id, request)
        return ResponseEntity.ok(ApiResponse.success(updatedMatch, "Match updated successfully"))
    }

    @AdminPermissionRequired(level = AdminLevel.SUBDOMAIN)
    @PutMapping("/{id}/score")
    fun updateScore(
        @RequestAttribute("adminInfo") adminInfo: AdminInfo,
        @PathVariable id: Long,
        @Valid @RequestBody request: MatchScoreRequest
    ): ResponseEntity<ApiResponse<MatchDto>> {
        val match = matchService.findMatchById(id)
            ?: throw MatchNotFoundException(id)

        if (adminInfo.adminLevel == AdminLevel.SUBDOMAIN) {
            val team = teamService.findByCode(adminInfo.teamSubdomain!!)
                ?: throw UnauthorizedAdminAccessException("Invalid team subdomain")
            if (match.homeTeam.id != team.id && match.awayTeam.id != team.id) {
                throw UnauthorizedAdminAccessException("Subdomain admin can only update their own team's matches")
            }
        }

        val updatedMatch = matchService.updateMatchScore(id, request.homeTeamScore, request.awayTeamScore)
        return ResponseEntity.ok(ApiResponse.success(updatedMatch, "Match score updated successfully"))
    }

    @AdminPermissionRequired(level = AdminLevel.MASTER)
    @DeleteMapping("/{id}")
    fun deleteMatch(@PathVariable id: Long): ResponseEntity<ApiResponse<String>> {
        matchService.deleteMatch(id)
        return ResponseEntity.ok(ApiResponse.success("deleted", "Match deleted successfully"))
    }
}
