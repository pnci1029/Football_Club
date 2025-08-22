package io.be.controller.admin

import com.fasterxml.jackson.databind.ObjectMapper
import io.be.dto.CreatePlayerRequest
import io.be.dto.PlayerDto
import io.be.dto.UpdatePlayerRequest
import io.be.service.PlayerService
import io.be.service.SubdomainService
import io.be.config.SubdomainResolver
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.mockito.kotlin.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@WebMvcTest(AdminPlayerController::class)
@WithMockUser
class AdminPlayerControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var playerService: PlayerService
    
    @MockBean
    private lateinit var subdomainService: SubdomainService
    
    @MockBean 
    private lateinit var subdomainResolver: SubdomainResolver

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Test
    fun `getAllPlayers should return players for team`() {
        val playerDto = PlayerDto(1L, "Test Player", "Forward", "profile.jpg", 10, 1L, "Test Team", true)
        val page = PageImpl(listOf(playerDto), PageRequest.of(0, 10), 1)
        
        given(playerService.findPlayersByTeam(1L, PageRequest.of(0, 10))).willReturn(page)

        mockMvc.perform(get("/api/admin/players")
                .param("teamId", "1")
                .param("page", "0")
                .param("size", "10"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.content[0].name").value("Test Player"))
    }

    @Test
    fun `getAllPlayers should return error when teamId is missing`() {
        mockMvc.perform(get("/api/admin/players")
                .param("page", "0")
                .param("size", "10"))
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.error.code").value("TEAM_ID_REQUIRED"))
    }

    @Test
    fun `createPlayer should create new player`() {
        val request = CreatePlayerRequest("New Player", "Midfielder", 9, "profile.jpg")
        val playerDto = PlayerDto(1L, "New Player", "Midfielder", "profile.jpg", 9, 1L, "Test Team", true)
        
        given(playerService.createPlayer(1L, request)).willReturn(playerDto)

        mockMvc.perform(post("/api/admin/players")
                .param("teamId", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.name").value("New Player"))
    }

    @Test
    fun `getPlayer should return player when found`() {
        val playerDto = PlayerDto(1L, "Test Player", "Forward", "profile.jpg", 10, 1L, "Test Team", true)
        
        given(playerService.findPlayerById(1L)).willReturn(playerDto)

        mockMvc.perform(get("/api/admin/players/1"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.name").value("Test Player"))
    }

    @Test
    fun `getPlayer should return 404 when not found`() {
        given(playerService.findPlayerById(1L)).willReturn(null)

        mockMvc.perform(get("/api/admin/players/1"))
            .andExpect(status().isNotFound)
    }

    @Test
    fun `updatePlayer should update existing player`() {
        val request = UpdatePlayerRequest("Updated Player", "Defender", 11, "profile.jpg", false)
        val playerDto = PlayerDto(1L, "Updated Player", "Defender", "profile.jpg", 11, 1L, "Test Team", false)
        
        given(playerService.updatePlayer(1L, request)).willReturn(playerDto)

        mockMvc.perform(put("/api/admin/players/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.name").value("Updated Player"))
    }

    @Test
    fun `deletePlayer should delete player`() {
        // No need to mock void method for this test

        mockMvc.perform(delete("/api/admin/players/1"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data").value("Player deleted successfully"))
    }
}