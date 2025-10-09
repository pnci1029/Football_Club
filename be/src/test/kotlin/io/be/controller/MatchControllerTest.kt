package io.be.match.presentation

import io.be.match.application.MatchService
import io.be.shared.config.SubdomainResolver
import io.be.shared.service.SubdomainService
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.test.context.TestPropertySource
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@WebMvcTest(io.be.shared.controller.MatchController::class)
@WithMockUser
@TestPropertySource(properties = [
    "spring.jpa.hibernate.ddl-auto=none",
    "spring.datasource.url=jdbc:h2:mem:testdb"
])
class MatchControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var matchService: MatchService

    @MockBean
    private lateinit var subdomainService: SubdomainService

    @MockBean
    private lateinit var subdomainResolver: SubdomainResolver

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
