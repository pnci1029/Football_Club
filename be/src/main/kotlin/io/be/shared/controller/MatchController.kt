package io.be.shared.controller

import io.be.match.dto.CreateMatchRequest
import io.be.match.dto.MatchDto
import io.be.match.dto.MatchScoreRequest
import io.be.team.dto.TeamDto
import io.be.match.dto.UpdateMatchRequest
import io.be.match.domain.MatchStatus
import io.be.shared.exception.TeamNotFoundException
import io.be.match.application.MatchService
import jakarta.validation.Valid
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.http.HttpStatus
import io.be.shared.util.ApiResponse
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v1/matches")
@CrossOrigin(origins = ["*"])
class MatchController(
    private val matchService: MatchService
) {
    
    @GetMapping
    fun getMatches(
        @RequestParam(required = false) status: MatchStatus?,
        pageable: Pageable
    ): ApiResponse<Page<MatchDto>> {
        val matches = if (status != null) {
            matchService.findMatchesByStatus(status, pageable)
        } else {
            matchService.findAllMatches(pageable)
        }
        return ApiResponse.success(matches)
    }
    
    @GetMapping("/{id}")
    fun getMatch(@PathVariable id: Long): ApiResponse<MatchDto> {
        val match = matchService.findMatchById(id)
            ?: return ApiResponse.error("NOT_FOUND", "찾을 수 없습니다.")
        return ApiResponse.success(match)
    }
    
    @GetMapping("/my-team")
    fun getMatchesByTeam(
        @RequestParam(required = false) status: MatchStatus?,
        @RequestAttribute("team", required = false) team: TeamDto?,
        pageable: Pageable
    ): ApiResponse<Page<MatchDto>> {
        team ?: throw TeamNotFoundException("Team not found for subdomain")
        
        val matches = if (status != null) {
            matchService.findMatchesByTeamAndStatus(team.id, status, pageable)
        } else {
            matchService.findMatchesByTeam(team.id, pageable)
        }
        return ApiResponse.success(matches)
    }
    
    @GetMapping("/my-team/upcoming")
    fun getUpcomingMatches(@RequestAttribute("team", required = false) team: TeamDto?): ApiResponse<List<MatchDto>> {
        team ?: throw TeamNotFoundException("Team not found for subdomain")
        
        val matches = matchService.findUpcomingMatches(team.id)
        return ApiResponse.success(matches)
    }
    
    @GetMapping("/stadium/{stadiumId}")
    fun getMatchesByStadium(
        @PathVariable stadiumId: Long,
        pageable: Pageable
    ): ApiResponse<Page<MatchDto>> {
        val matches = matchService.findMatchesByStadium(stadiumId, pageable)
        return ApiResponse.success(matches)
    }
    
    @PostMapping
    fun createMatch(
        @Valid @RequestBody request: CreateMatchRequest
    ): ApiResponse<MatchDto> {
        val match = matchService.createMatch(request)
        return ApiResponse.success(match)
    }
    
    @PutMapping("/{id}")
    fun updateMatch(
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdateMatchRequest
    ): ApiResponse<MatchDto> {
        val match = matchService.updateMatch(id, request)
        return ApiResponse.success(match)
    }
    
    @PatchMapping("/{id}/score")
    fun updateMatchScore(
        @PathVariable id: Long,
        @Valid @RequestBody request: MatchScoreRequest
    ): ApiResponse<MatchDto> {
        val match = matchService.updateMatchScore(id, request.homeTeamScore, request.awayTeamScore)
        return ApiResponse.success(match)
    }
    
    @PatchMapping("/{id}/status")
    fun updateMatchStatus(
        @PathVariable id: Long,
        @RequestParam status: MatchStatus
    ): ApiResponse<MatchDto> {
        val match = matchService.updateMatchStatus(id, status)
        return ApiResponse.success(match)
    }
    
    @DeleteMapping("/{id}")
    fun deleteMatch(@PathVariable id: Long): ApiResponse<String> {
        matchService.deleteMatch(id)
        return ApiResponse.success("경기가 성공적으로 삭제되었습니다")
    }
}