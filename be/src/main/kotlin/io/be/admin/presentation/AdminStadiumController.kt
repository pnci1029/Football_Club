package io.be.admin.presentation

import io.be.admin.dto.AdminInfo
import io.be.admin.domain.AdminLevel
import io.be.stadium.dto.CreateStadiumRequest
import io.be.stadium.dto.StadiumDto
import io.be.stadium.dto.UpdateStadiumRequest
import io.be.stadium.application.StadiumService
import io.be.shared.exception.MissingRequiredFieldException
import io.be.shared.exception.UnauthorizedAdminAccessException
import io.be.shared.security.AdminPermissionRequired
import io.be.shared.service.SubdomainService
import io.be.team.application.TeamService
import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.Valid
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v1/admin/stadiums")
@CrossOrigin(origins = ["*"])
class AdminStadiumController(
    private val stadiumService: StadiumService,
    private val subdomainService: SubdomainService,
    private val teamService: TeamService
) {

    @AdminPermissionRequired(level = AdminLevel.SUBDOMAIN)
    @GetMapping
    fun getAllStadiums(
        @RequestAttribute("adminInfo") adminInfo: AdminInfo,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "10") size: Int,
        @RequestParam(required = false) teamId: Long?
    ): ResponseEntity<Page<StadiumDto>> {
        val stadiums = when (adminInfo.adminLevel) {
            AdminLevel.MASTER -> {
                if (teamId != null) {
                    stadiumService.findStadiumsByTeam(teamId, PageRequest.of(page, size))
                } else {
                    stadiumService.findAllStadiums(PageRequest.of(page, size))
                }
            }
            AdminLevel.SUBDOMAIN -> {
                // 서브도메인 관리자는 자신의 팀 구장만 조회
                val team = teamService.findByCode(adminInfo.teamSubdomain!!)
                    ?: throw UnauthorizedAdminAccessException("Invalid team subdomain")
                
                if (teamId != null && teamId != team.id) {
                    throw UnauthorizedAdminAccessException("Subdomain admin can only access their own team stadiums")
                }
                
                stadiumService.findStadiumsByTeam(team.id, PageRequest.of(page, size))
            }
        }
        return ResponseEntity.ok(stadiums)
    }

    @PostMapping
    fun createStadium(
        @Valid @RequestBody request: CreateStadiumRequest,
        @RequestParam(required = false) teamId: Long?,
        httpRequest: HttpServletRequest
    ): ResponseEntity<StadiumDto> {
        // 관리자 페이지에서는 teamId 파라미터 사용
        val finalTeamId = if (teamId != null) {
            teamId
        } else {
            // 서브도메인에서는 기존 로직 사용
            val teamCode = subdomainService.extractTeamCodeFromRequest(httpRequest)
                ?: throw MissingRequiredFieldException("유효하지 않은 서브도메인입니다.")

            val team = subdomainService.getTeamByCode(teamCode)
                ?: throw MissingRequiredFieldException("팀을 찾을 수 없습니다.")

            team.id
        }

        val requestWithTeam = request.copy(teamId = finalTeamId)
        val stadium = stadiumService.createStadium(requestWithTeam)
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(stadium)
    }

    @GetMapping("/{id}")
    fun getStadium(@PathVariable id: Long): ResponseEntity<StadiumDto> {
        val stadium = stadiumService.findStadiumById(id)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(stadium)
    }

    @PutMapping("/{id}")
    fun updateStadium(
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdateStadiumRequest
    ): ResponseEntity<StadiumDto> {
        val updatedStadium = stadiumService.updateStadium(id, request)
        return ResponseEntity.ok(updatedStadium)
    }

    @DeleteMapping("/{id}")
    fun deleteStadium(@PathVariable id: Long): ResponseEntity<String> {
        stadiumService.deleteStadium(id)
        return ResponseEntity.ok("Stadium deleted successfully")
    }

    @GetMapping("/search")
    fun searchStadiums(
        @RequestParam(required = false) name: String?,
        @RequestParam(required = false) address: String?
    ): ResponseEntity<List<StadiumDto>> {
        val stadiums = when {
            !name.isNullOrBlank() -> stadiumService.searchStadiumsByName(name)
            !address.isNullOrBlank() -> stadiumService.searchStadiumsByAddress(address)
            else -> emptyList()
        }

        return ResponseEntity.ok(stadiums)
    }
}
