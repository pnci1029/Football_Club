package io.be.team.presentation

import io.be.team.dto.TeamDto
import io.be.shared.service.SubdomainService
import io.be.team.application.TeamService
import io.be.shared.exception.BadRequestException
import jakarta.servlet.http.HttpServletRequest
import io.be.shared.util.ApiResponse
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v1/team")
@CrossOrigin(origins = ["*"])
class TeamController(
    private val teamService: TeamService,
    private val subdomainService: SubdomainService
) {
    
    @GetMapping("/info")
    fun getCurrentTeamInfo(request: HttpServletRequest): ApiResponse<TeamDto> {
        val teamCode = subdomainService.extractTeamCodeFromRequest(request)
            ?: throw BadRequestException("유효하지 않은 서브도메인입니다.")
                
        val team = teamService.findTeamByCode(teamCode)
            ?: return ApiResponse.error("NOT_FOUND", "팀을 찾을 수 없습니다.")
                
        return ApiResponse.success(team)
    }
    
    @GetMapping("/players")
    fun getCurrentTeamPlayers(request: HttpServletRequest): ApiResponse<Any> {
        val teamCode = subdomainService.extractTeamCodeFromRequest(request)
            ?: throw BadRequestException("유효하지 않은 서브도메인입니다.")
        
        // TODO: PlayerService에서 팀별 선수 조회 기능 구현 필요
        return ApiResponse.success("팀별 선수 조회 기능 - 구현 예정")
    }
    
    @GetMapping("/matches")
    fun getCurrentTeamMatches(request: HttpServletRequest): ApiResponse<Any> {
        val teamCode = subdomainService.extractTeamCodeFromRequest(request)
            ?: throw BadRequestException("유효하지 않은 서브도메인입니다.")
        
        // TODO: MatchService에서 팀별 경기 조회 기능 구현 필요
        return ApiResponse.success("팀별 경기 조회 기능 - 구현 예정")
    }
    
    @GetMapping("/stadiums")
    fun getCurrentTeamStadiums(request: HttpServletRequest): ApiResponse<Any> {
        val teamCode = subdomainService.extractTeamCodeFromRequest(request)
            ?: throw BadRequestException("유효하지 않은 서브도메인입니다.")
        
        // TODO: StadiumService에서 팀별 구장 조회 기능 구현 필요
        return ApiResponse.success("팀별 구장 조회 기능 - 구현 예정")
    }
}