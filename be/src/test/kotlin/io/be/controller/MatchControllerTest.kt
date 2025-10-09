package io.be.match.presentation

import io.be.match.application.MatchService
import io.be.match.dto.MatchDto
import io.be.match.dto.CreateMatchRequest
import io.be.shared.controller.MatchController
import io.be.team.dto.TeamDto
import io.be.stadium.dto.StadiumDto
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.BDDMockito.given
import org.mockito.kotlin.any
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import org.springframework.http.HttpStatus
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

@ExtendWith(MockitoExtension::class)
class MatchControllerTest {

    @Mock
    private lateinit var matchService: MatchService

    @InjectMocks
    private lateinit var matchController: MatchController

    @Test
    fun `getMatches should return paginated matches`() {
        // Given
        val homeTeam = TeamDto(1L, "HOME", "Home Team", "Home Description", "logo1.jpg")
        val awayTeam = TeamDto(2L, "AWAY", "Away Team", "Away Description", "logo2.jpg")
        val stadium = StadiumDto(1L, "Test Stadium", "Test Address", 37.5665, 126.9780, 1L, "Home Team", listOf("Test facilities"), 50000, "09:00-22:00", listOf("월", "화", "수", "목", "금"), "010-1234-5678", listOf("image1.jpg"))
        val matchDto = MatchDto(
            id = 1L,
            homeTeam = homeTeam,
            awayTeam = awayTeam,
            stadium = stadium,
            matchDate = java.time.LocalDateTime.now(),
            homeTeamScore = null,
            awayTeamScore = null,
            status = io.be.match.domain.MatchStatus.SCHEDULED,
            createdAt = java.time.LocalDateTime.now(),
            updatedAt = java.time.LocalDateTime.now()
        )
        val page = PageImpl(listOf(matchDto), PageRequest.of(0, 10), 1)
        given(matchService.findAllMatches(any())).willReturn(page)

        // When
        val response = matchController.getMatches(null, PageRequest.of(0, 10))

        // Then
        assertEquals(HttpStatus.OK, response.statusCode)
        assertNotNull(response.body)
        assertEquals(true, response.body!!.success)
    }

    @Test
    fun `getMatch should return match when found`() {
        // Given
        val homeTeam = TeamDto(1L, "HOME", "Home Team", "Home Description", "logo1.jpg")
        val awayTeam = TeamDto(2L, "AWAY", "Away Team", "Away Description", "logo2.jpg")
        val stadium = StadiumDto(1L, "Test Stadium", "Test Address", 37.5665, 126.9780, 1L, "Home Team", listOf("Test facilities"), 50000, "09:00-22:00", listOf("월", "화", "수", "목", "금"), "010-1234-5678", listOf("image1.jpg"))
        val matchDto = MatchDto(
            id = 1L,
            homeTeam = homeTeam,
            awayTeam = awayTeam,
            stadium = stadium,
            matchDate = java.time.LocalDateTime.now(),
            homeTeamScore = null,
            awayTeamScore = null,
            status = io.be.match.domain.MatchStatus.SCHEDULED,
            createdAt = java.time.LocalDateTime.now(),
            updatedAt = java.time.LocalDateTime.now()
        )
        given(matchService.findMatchById(1L)).willReturn(matchDto)

        // When
        val response = matchController.getMatch(1L)

        // Then
        assertEquals(HttpStatus.OK, response.statusCode)
        assertNotNull(response.body)
        assertEquals(true, response.body!!.success)
        assertEquals(1L, response.body!!.data?.id)
    }

    @Test
    fun `getMatch should return 404 when not found`() {
        // Given
        given(matchService.findMatchById(1L)).willReturn(null)

        // When
        val response = matchController.getMatch(1L)

        // Then
        assertEquals(HttpStatus.NOT_FOUND, response.statusCode)
    }
}
