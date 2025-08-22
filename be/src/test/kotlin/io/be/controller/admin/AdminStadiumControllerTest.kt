package io.be.controller.admin

import com.fasterxml.jackson.databind.ObjectMapper
import io.be.dto.CreateStadiumRequest
import io.be.dto.StadiumDto
import io.be.dto.UpdateStadiumRequest
import io.be.service.StadiumService
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

@WebMvcTest(AdminStadiumController::class)
@WithMockUser
class AdminStadiumControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var stadiumService: StadiumService
    
    @MockBean
    private lateinit var subdomainService: SubdomainService
    
    @MockBean 
    private lateinit var subdomainResolver: SubdomainResolver

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Test
    fun `createStadium should create new stadium`() {
        val request = CreateStadiumRequest("New Stadium", "New Address", 37.5665, 126.9780, "Test facilities", 60000, "09:00-22:00", "010-1234-5678", "image1.jpg")
        val stadiumDto = StadiumDto(1L, "New Stadium", "New Address", 37.5665, 126.9780, "Test facilities", 60000, "09:00-22:00", "010-1234-5678", "image1.jpg")
        
        given(stadiumService.createStadium(request)).willReturn(stadiumDto)

        mockMvc.perform(post("/api/admin/stadiums")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.name").value("New Stadium"))
    }

    @Test
    fun `updateStadium should update existing stadium`() {
        val request = UpdateStadiumRequest("Updated Stadium", "Updated Address", 37.5665, 126.9780, "Updated facilities", 70000, "09:00-22:00", "010-1234-5678", "image1.jpg")
        val stadiumDto = StadiumDto(1L, "Updated Stadium", "Updated Address", 37.5665, 126.9780, "Updated facilities", 70000, "09:00-22:00", "010-1234-5678", "image1.jpg")
        
        given(stadiumService.updateStadium(1L, request)).willReturn(stadiumDto)

        mockMvc.perform(put("/api/admin/stadiums/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.name").value("Updated Stadium"))
    }

    @Test
    fun `deleteStadium should delete stadium`() {
        // No need to mock void method for this test

        mockMvc.perform(delete("/api/admin/stadiums/1"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data").value("Stadium deleted successfully"))
    }

    @Test
    fun `getAllStadiums should return paginated stadiums`() {
        val stadiumDto = StadiumDto(1L, "Test Stadium", "Test Address", 37.5665, 126.9780, "Test facilities", 50000, "09:00-22:00", "010-1234-5678", "image1.jpg")
        val page = PageImpl(listOf(stadiumDto), PageRequest.of(0, 10), 1)
        
        given(stadiumService.findAllStadiums(any())).willReturn(page)

        mockMvc.perform(get("/api/admin/stadiums")
                .param("page", "0")
                .param("size", "10"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.content[0].name").value("Test Stadium"))
    }
}