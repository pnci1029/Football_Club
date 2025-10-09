package io.be.controller

import io.be.shared.controller.HeroSlideController
import io.be.heroslide.application.HeroSlideService
import io.be.heroslide.dto.HeroSlideDto
import io.be.heroslide.domain.GradientColor
import io.be.shared.service.SubdomainService
import io.be.team.dto.TeamDto
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.mockito.kotlin.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.test.context.TestPropertySource
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import java.time.LocalDateTime

@WebMvcTest(HeroSlideController::class)
@WithMockUser
@TestPropertySource(properties = [
    "spring.jpa.hibernate.ddl-auto=none",
    "spring.datasource.url=jdbc:h2:mem:testdb"
])
class HeroSlideControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var heroSlideService: HeroSlideService

    @MockBean
    private lateinit var subdomainService: SubdomainService

    @Test
    fun `getActiveSlides should return active slides for valid team`() {
        val teamDto = TeamDto(1L, "test-team", "Test Team", "Test Description", "logo.jpg")
        val heroSlideDto = HeroSlideDto(
            id = 1L,
            title = "Test Slide",
            subtitle = "Test Subtitle", 
            backgroundImage = "test-image.jpg",
            gradientColor = GradientColor.BLUE,
            isActive = true,
            sortOrder = 1,
            createdAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now()
        )
        
        given(subdomainService.extractTeamCodeFromRequest(any())).willReturn("test-team")
        given(subdomainService.getTeamByCode("test-team")).willReturn(teamDto)
        given(heroSlideService.getActiveSlidesForTeam(1L)).willReturn(listOf(heroSlideDto))

        mockMvc.perform(get("/v1/hero-slides/active"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data[0].title").value("Test Slide"))
            .andExpect(jsonPath("$.data[0].isActive").value(true))
    }

    @Test
    fun `getActiveSlides should return error for invalid subdomain`() {
        given(subdomainService.extractTeamCodeFromRequest(any())).willReturn(null)

        mockMvc.perform(get("/v1/hero-slides/active"))
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.error.code").value("INVALID_SUBDOMAIN"))
    }

    @Test
    fun `getActiveSlides should return 404 for non-existent team`() {
        given(subdomainService.extractTeamCodeFromRequest(any())).willReturn("non-existent")
        given(subdomainService.getTeamByCode("non-existent")).willReturn(null)

        mockMvc.perform(get("/v1/hero-slides/active"))
            .andExpect(status().isNotFound)
    }
}