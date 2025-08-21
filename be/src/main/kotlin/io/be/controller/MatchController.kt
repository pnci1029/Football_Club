package io.be.controller

import io.be.dto.CreateMatchRequest
import io.be.dto.MatchDto
import io.be.dto.MatchScoreRequest
import io.be.dto.UpdateMatchRequest
import io.be.entity.MatchStatus
import io.be.service.MatchService
import io.be.util.ApiResponse
import jakarta.validation.Valid
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/matches")
@CrossOrigin(origins = ["*"])
class MatchController(
    private val matchService: MatchService
) {
    
    @GetMapping
    fun getMatches(
        @RequestParam(required = false) status: MatchStatus?,
        pageable: Pageable
    ): ResponseEntity<ApiResponse<Page<MatchDto>>> {
        val matches = if (status != null) {
            matchService.findMatchesByStatus(status, pageable)
        } else {
            matchService.findAllMatches(pageable)
        }
        return ResponseEntity.ok(ApiResponse.success(matches))
    }
    
    @GetMapping("/{id}")
    fun getMatch(@PathVariable id: Long): ResponseEntity<ApiResponse<MatchDto>> {
        val match = matchService.findMatchById(id)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(ApiResponse.success(match))
    }
    
    @GetMapping("/team/{teamId}")
    fun getMatchesByTeam(
        @PathVariable teamId: Long,
        @RequestParam(required = false) status: MatchStatus?,
        pageable: Pageable
    ): ResponseEntity<ApiResponse<Page<MatchDto>>> {
        val matches = if (status != null) {
            matchService.findMatchesByTeamAndStatus(teamId, status, pageable)
        } else {
            matchService.findMatchesByTeam(teamId, pageable)
        }
        return ResponseEntity.ok(ApiResponse.success(matches))
    }
    
    @GetMapping("/team/{teamId}/upcoming")
    fun getUpcomingMatches(@PathVariable teamId: Long): ResponseEntity<ApiResponse<List<MatchDto>>> {
        val matches = matchService.findUpcomingMatches(teamId)
        return ResponseEntity.ok(ApiResponse.success(matches))
    }
    
    @GetMapping("/stadium/{stadiumId}")
    fun getMatchesByStadium(
        @PathVariable stadiumId: Long,
        pageable: Pageable
    ): ResponseEntity<ApiResponse<Page<MatchDto>>> {
        val matches = matchService.findMatchesByStadium(stadiumId, pageable)
        return ResponseEntity.ok(ApiResponse.success(matches))
    }
    
    @PostMapping
    fun createMatch(
        @Valid @RequestBody request: CreateMatchRequest
    ): ResponseEntity<ApiResponse<MatchDto>> {
        val match = matchService.createMatch(request)
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(match))
    }
    
    @PutMapping("/{id}")
    fun updateMatch(
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdateMatchRequest
    ): ResponseEntity<ApiResponse<MatchDto>> {
        val match = matchService.updateMatch(id, request)
        return ResponseEntity.ok(ApiResponse.success(match))
    }
    
    @PatchMapping("/{id}/score")
    fun updateMatchScore(
        @PathVariable id: Long,
        @Valid @RequestBody request: MatchScoreRequest
    ): ResponseEntity<ApiResponse<MatchDto>> {
        val match = matchService.updateMatchScore(id, request.homeTeamScore, request.awayTeamScore)
        return ResponseEntity.ok(ApiResponse.success(match))
    }
    
    @PatchMapping("/{id}/status")
    fun updateMatchStatus(
        @PathVariable id: Long,
        @RequestParam status: MatchStatus
    ): ResponseEntity<ApiResponse<MatchDto>> {
        val match = matchService.updateMatchStatus(id, status)
        return ResponseEntity.ok(ApiResponse.success(match))
    }
    
    @DeleteMapping("/{id}")
    fun deleteMatch(@PathVariable id: Long): ResponseEntity<ApiResponse<String>> {
        matchService.deleteMatch(id)
        return ResponseEntity.ok(ApiResponse.success("경기가 성공적으로 삭제되었습니다"))
    }
}