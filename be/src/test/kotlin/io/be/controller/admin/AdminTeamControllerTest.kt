package io.be.controller.admin

import com.fasterxml.jackson.databind.ObjectMapper
import io.be.dto.CreateTeamRequest
import io.be.dto.TeamDto
import io.be.dto.UpdateTeamRequest
import io.be.service.TeamService
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

@WebMvcTest(AdminTeamController::class)
@WithMockUser
class AdminTeamControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var teamService: TeamService

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Test
    fun `getAllTeams should return paginated teams`() {
        val teamDto = TeamDto(1L, "TT", "Test Team", "Test description", "logo.jpg")
        val page = PageImpl(listOf(teamDto), PageRequest.of(0, 10), 1)
        
        given(teamService.findAllTeams(any())).willReturn(page)

        mockMvc.perform(get("/api/admin/teams")
                .param("page", "0")
                .param("size", "10"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.content[0].name").value("Test Team"))
    }

    @Test
    fun `createTeam should create new team`() {
        val request = CreateTeamRequest("NT", "New Team", "New description", "logo.jpg")
        val teamDto = TeamDto(1L, "NT", "New Team", "New description", "logo.jpg")
        
        given(teamService.createTeam(request)).willReturn(teamDto)

        mockMvc.perform(post("/api/admin/teams")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.name").value("New Team"))
    }

    @Test
    fun `getTeam should return team when found`() {
        val teamDto = TeamDto(1L, "TT", "Test Team", "Test description", "logo.jpg")
        
        given(teamService.findTeamById(1L)).willReturn(teamDto)

        mockMvc.perform(get("/api/admin/teams/1"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.name").value("Test Team"))
    }

    @Test
    fun `getTeam should return 404 when not found`() {
        given(teamService.findTeamById(1L)).willReturn(null)

        mockMvc.perform(get("/api/admin/teams/1"))
            .andExpect(status().isNotFound)
    }

    @Test
    fun `updateTeam should update existing team`() {
        val request = UpdateTeamRequest("Updated Team", "Updated description", "logo.jpg")
        val teamDto = TeamDto(1L, "TT", "Updated Team", "Updated description", "logo.jpg")
        
        given(teamService.updateTeam(1L, request)).willReturn(teamDto)

        mockMvc.perform(put("/api/admin/teams/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.name").value("Updated Team"))
    }

    @Test
    fun `deleteTeam should delete team`() {
        // No need to mock void method for this test

        mockMvc.perform(delete("/api/admin/teams/1"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data").value("Team deleted successfully"))
    }

    @Test
    fun `getTeamByCode should return team when found`() {
        val teamDto = TeamDto(1L, "TT", "Test Team", "Test description", "logo.jpg")
        
        given(teamService.findTeamByCode("TT")).willReturn(teamDto)

        mockMvc.perform(get("/api/admin/teams/code/TT"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.code").value("TT"))
    }

    @Test
    fun `getTeamByCode should return 404 when not found`() {
        given(teamService.findTeamByCode("XX")).willReturn(null)

        mockMvc.perform(get("/api/admin/teams/code/XX"))
            .andExpect(status().isNotFound)
    }
}