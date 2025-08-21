package io.be.controller

import io.be.service.MatchService
import org.junit.jupiter.api.Test
import org.mockito.kotlin.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.data.domain.PageRequest
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@WebMvcTest(MatchController::class)
@WithMockUser
class MatchControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var matchService: MatchService

    @Test
    fun `getMatches should accept GET request`() {
        mockMvc.perform(get("/api/v1/matches")
                .param("page", "0")
                .param("size", "10"))
            .andExpect(status().isOk)
    }

    @Test
    fun `getMatch should accept GET request with id`() {
        mockMvc.perform(get("/api/v1/matches/1"))
            .andExpect(status().isOk)
    }

    @Test
    fun `getMatchesByTeam should accept GET request with team id`() {
        mockMvc.perform(get("/api/v1/matches/team/1")
                .param("page", "0")
                .param("size", "10"))
            .andExpect(status().isOk)
    }

    @Test
    fun `createMatch should accept POST request`() {
        mockMvc.perform(post("/api/v1/matches"))
            .andExpect(status().isOk)
    }
}