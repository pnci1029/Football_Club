package io.be.stadium.presentation

import io.be.shared.controller.StadiumController
import io.be.stadium.dto.StadiumDto
import io.be.stadium.application.StadiumService
import io.be.shared.service.SubdomainService
import io.be.shared.config.SubdomainResolver
import io.be.shared.util.ApiResponse
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

@WebMvcTest
@WithMockUser
class StadiumControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var stadiumService: StadiumService
    
    @MockBean
    private lateinit var subdomainService: SubdomainService
    
    @MockBean 
    private lateinit var subdomainResolver: SubdomainResolver

    @Test
    fun `getAllStadiums should return paginated stadiums`() {
        val stadiumDto = StadiumDto(1L, "Test Stadium", "Test Address", 37.5665, 126.9780, 1L, "Test Team", listOf("Test facilities"), 50000, "09:00-22:00", listOf("월", "화", "수", "목", "금"), "010-1234-5678", listOf("image1.jpg"))
        val page = PageImpl(listOf(stadiumDto), PageRequest.of(0, 10), 1)
        
        given(stadiumService.findAllStadiums(any())).willReturn(page)

        mockMvc.perform(get("/api/v1/stadiums")
                .param("page", "0")
                .param("size", "10"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.content[0].id").value(1))
            .andExpect(jsonPath("$.data.content[0].name").value("Test Stadium"))
    }

    @Test
    fun `getStadium should return stadium when found`() {
        val stadiumDto = StadiumDto(1L, "Test Stadium", "Test Address", 37.5665, 126.9780, 1L, "Test Team", listOf("Test facilities"), 50000, "09:00-22:00", listOf("월", "화", "수", "목", "금"), "010-1234-5678", listOf("image1.jpg"))
        
        given(stadiumService.findStadiumById(1L)).willReturn(stadiumDto)

        mockMvc.perform(get("/api/v1/stadiums/1"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.id").value(1))
            .andExpect(jsonPath("$.data.name").value("Test Stadium"))
    }

    @Test
    fun `getStadium should return 404 when not found`() {
        given(stadiumService.findStadiumById(1L)).willReturn(null)

        mockMvc.perform(get("/api/v1/stadiums/1"))
            .andExpect(status().isNotFound)
    }

    @Test
    fun `searchStadiums should return stadiums by name`() {
        val stadiumDto = StadiumDto(1L, "Test Stadium", "Test Address", 37.5665, 126.9780, 1L, "Test Team", listOf("Test facilities"), 50000, "09:00-22:00", listOf("월", "화", "수", "목", "금"), "010-1234-5678", listOf("image1.jpg"))
        
        given(stadiumService.searchStadiumsByName("Test")).willReturn(listOf(stadiumDto))

        mockMvc.perform(get("/api/v1/stadiums/search")
                .param("name", "Test"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data[0].name").value("Test Stadium"))
    }

    @Test
    fun `searchStadiums should return stadiums by address`() {
        val stadiumDto = StadiumDto(1L, "Test Stadium", "Test Address", 37.5665, 126.9780, 1L, "Test Team", listOf("Test facilities"), 50000, "09:00-22:00", listOf("월", "화", "수", "목", "금"), "010-1234-5678", listOf("image1.jpg"))
        
        given(stadiumService.searchStadiumsByAddress("Test Address")).willReturn(listOf(stadiumDto))

        mockMvc.perform(get("/api/v1/stadiums/search")
                .param("address", "Test Address"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data[0].address").value("Test Address"))
    }

    @Test
    fun `searchStadiums should return empty list when no parameters`() {
        mockMvc.perform(get("/api/v1/stadiums/search"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data").isEmpty)
    }
}