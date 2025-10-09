package io.be.controller.admin

import com.fasterxml.jackson.databind.ObjectMapper
import io.be.admin.presentation.AdminPlayerController
import io.be.player.application.PlayerService
import io.be.player.dto.CreatePlayerRequest
import io.be.player.dto.PlayerDto
import io.be.player.dto.UpdatePlayerRequest
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.mockito.kotlin.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import org.springframework.http.MediaType
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.test.context.TestPropertySource
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@WebMvcTest(AdminPlayerController::class)
@WithMockUser
@TestPropertySource(properties = [
    "spring.jpa.hibernate.ddl-auto=none",
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.security.oauth2.client.provider.oidc.issuer-uri=",
    "spring.security.oauth2.client.registration.oidc.client-id=test",
    "spring.security.oauth2.client.registration.oidc.client-secret=test"
])
class AdminPlayerControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var playerService: PlayerService

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Test
    fun `getAllPlayers should return players for team`() {
        val playerDto = PlayerDto(1L, "Test Player", "FW", "profile.jpg", 10, 1L, "Test Team", true)
        val page = PageImpl(listOf(playerDto), PageRequest.of(0, 10), 1)
        
        given(playerService.findPlayersByTeam(1L, PageRequest.of(0, 10))).willReturn(page)

        mockMvc.perform(get("/v1/admin/players")
                .param("teamId", "1")
                .param("page", "0")
                .param("size", "10"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.content[0].name").value("Test Player"))
    }

    @Test
    fun `createPlayer should create new player`() {
        val request = CreatePlayerRequest("New Player", "MF", 9, "profile.jpg")
        val playerDto = PlayerDto(1L, "New Player", "MF", "profile.jpg", 9, 1L, "Test Team", true)
        
        given(playerService.createPlayer(1L, request)).willReturn(playerDto)

        mockMvc.perform(post("/v1/admin/players")
                .param("teamId", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.name").value("New Player"))
    }

    @Test
    fun `getPlayer should return player when found`() {
        val playerDto = PlayerDto(1L, "Test Player", "FW", "profile.jpg", 10, 1L, "Test Team", true)
        
        given(playerService.findPlayerById(1L)).willReturn(playerDto)

        mockMvc.perform(get("/v1/admin/players/1"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.name").value("Test Player"))
    }

    @Test
    fun `deletePlayer should delete player`() {
        doNothing().whenever(playerService).deletePlayer(1L)

        mockMvc.perform(delete("/v1/admin/players/1"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
    }
}