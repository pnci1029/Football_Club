package io.be.player.presentation

import io.be.player.dto.PlayerDto
import io.be.team.dto.TeamDto
import io.be.player.application.PlayerService
import io.be.shared.service.SubdomainService
import io.be.shared.config.SubdomainResolver
import io.be.shared.controller.PlayerController
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.mockito.kotlin.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@WebMvcTest(PlayerController::class)
@WithMockUser
class PlayerControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var playerService: PlayerService

    @MockBean
    private lateinit var subdomainService: SubdomainService
    
    @MockBean 
    private lateinit var subdomainResolver: SubdomainResolver

    @Test
    fun `getPlayers should return players for valid team`() {
        val teamDto = TeamDto(1L, "TT", "Test Team", "Test description", "logo.jpg")
        val playerDto = PlayerDto(1L, "Test Player", "Forward", "profile.jpg", 1, 1L, "Test Team", true)
        val page = PageImpl(listOf(playerDto), PageRequest.of(0, 10), 1)
        
        given(subdomainService.getTeamBySubdomain("test-team.localhost")).willReturn(teamDto)
        given(playerService.findPlayersByTeam(1L, PageRequest.of(0, 10))).willReturn(page)

        mockMvc.perform(get("/api/v1/players")
                .header("Host", "test-team.localhost")
                .param("page", "0")
                .param("size", "10"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.content[0].name").value("Test Player"))
    }

    @Test
    fun `getPlayers should return error when team not found`() {
        given(subdomainService.getTeamBySubdomain("invalid.localhost")).willReturn(null)

        mockMvc.perform(get("/api/v1/players")
                .header("Host", "invalid.localhost"))
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.error.code").value("TEAM_NOT_FOUND"))
    }

    @Test
    fun `getPlayer should return player when found and belongs to team`() {
        val teamDto = TeamDto(1L, "TT", "Test Team", "Test description", "logo.jpg")
        val playerDto = PlayerDto(1L, "Test Player", "Forward", "profile.jpg", 1, 1L, "Test Team", true)
        
        given(subdomainService.getTeamBySubdomain("test-team.localhost")).willReturn(teamDto)
        given(playerService.findPlayerById(1L)).willReturn(playerDto)

        mockMvc.perform(get("/api/v1/players/1")
                .header("Host", "test-team.localhost"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.name").value("Test Player"))
    }

    @Test
    fun `getPlayer should return 404 when player not found`() {
        val teamDto = TeamDto(1L, "TT", "Test Team", "Test description", "logo.jpg")
        
        given(subdomainService.getTeamBySubdomain("test-team.localhost")).willReturn(teamDto)
        given(playerService.findPlayerById(1L)).willReturn(null)

        mockMvc.perform(get("/api/v1/players/1")
                .header("Host", "test-team.localhost"))
            .andExpect(status().isNotFound)
    }

    @Test
    fun `getPlayer should return 404 when player belongs to different team`() {
        val teamDto = TeamDto(1L, "TT", "Test Team", "Test description", "logo.jpg")
        val playerDto = PlayerDto(1L, "Test Player", "Forward", "profile.jpg", 1, 2L, "Other Team", true) // Different team
        
        given(subdomainService.getTeamBySubdomain("test-team.localhost")).willReturn(teamDto)
        given(playerService.findPlayerById(1L)).willReturn(playerDto)

        mockMvc.perform(get("/api/v1/players/1")
                .header("Host", "test-team.localhost"))
            .andExpect(status().isNotFound)
    }

    @Test
    fun `getActivePlayers should return active players for team`() {
        val teamDto = TeamDto(1L, "TT", "Test Team", "Test description", "logo.jpg")
        val playerDto = PlayerDto(1L, "Test Player", "Forward", "profile.jpg", 1, 1L, "Test Team", true)
        
        given(subdomainService.getTeamBySubdomain("test-team.localhost")).willReturn(teamDto)
        given(playerService.findActivePlayersByTeam(1L)).willReturn(listOf(playerDto))

        mockMvc.perform(get("/api/v1/players/active")
                .header("Host", "test-team.localhost"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data[0].name").value("Test Player"))
            .andExpect(jsonPath("$.data[0].isActive").value(true))
    }
}