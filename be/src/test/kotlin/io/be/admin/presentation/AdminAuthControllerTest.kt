package io.be.admin.presentation

import com.fasterxml.jackson.databind.ObjectMapper
import io.be.admin.application.AdminAuthService
import io.be.admin.dto.AdminInfo
import io.be.admin.dto.LoginRequest
import io.be.admin.dto.LoginResponse
import io.be.admin.dto.TokenResponse
import io.be.shared.exception.UnauthorizedAccessException
import io.be.shared.exception.InvalidRequestException
import org.junit.jupiter.api.Test
import org.mockito.kotlin.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.test.context.TestPropertySource
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@WebMvcTest(AdminAuthController::class)
@WithMockUser
@TestPropertySource(properties = [
    "spring.jpa.hibernate.ddl-auto=none",
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.security.oauth2.client.provider.oidc.issuer-uri=",
    "spring.security.oauth2.client.registration.oidc.client-id=test",
    "spring.security.oauth2.client.registration.oidc.client-secret=test"
])
class AdminAuthControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var adminAuthService: AdminAuthService

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Test
    fun `관리자 로그인 성공`() {
        val loginRequest = LoginRequest("admin", "password", "team1")
        val adminInfo = AdminInfo(1L, "admin", "ADMIN", "admin@test.com", "Admin User", "team1", "SUBDOMAIN")
        val loginResponse = LoginResponse("access-token", "refresh-token", adminInfo)

        whenever(adminAuthService.login(eq("admin"), eq("password"), any(), eq("team1"), any()))
            .thenReturn(loginResponse)

        mockMvc.perform(post("/v1/admin/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.accessToken").value("access-token"))
            .andExpect(jsonPath("$.data.refreshToken").value("refresh-token"))
            .andExpect(jsonPath("$.data.admin.username").value("admin"))
    }

    @Test
    fun `잘못된 인증 정보로 로그인 실패`() {
        val loginRequest = LoginRequest("admin", "wrongpassword", "team1")

        whenever(adminAuthService.login(eq("admin"), eq("wrongpassword"), any(), eq("team1"), any()))
            .thenThrow(UnauthorizedAccessException("Invalid username or password"))

        mockMvc.perform(post("/v1/admin/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
            .andExpect(status().isUnauthorized)
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.error.message").value("Invalid username or password"))
    }

    @Test
    fun `빈 사용자명으로 로그인 실패`() {
        val loginRequest = LoginRequest("", "password", "team1")

        whenever(adminAuthService.login(eq(""), eq("password"), any(), eq("team1"), any()))
            .thenThrow(InvalidRequestException("username", "", "Username and password are required"))

        mockMvc.perform(post("/v1/admin/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.success").value(false))
    }

    @Test
    fun `토큰 갱신 성공`() {
        val tokenResponse = TokenResponse("new-access-token", "refresh-token")

        whenever(adminAuthService.refreshToken("refresh-token"))
            .thenReturn(tokenResponse)

        mockMvc.perform(post("/v1/admin/auth/refresh")
                .header("Authorization", "Bearer refresh-token"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.accessToken").value("new-access-token"))
            .andExpect(jsonPath("$.data.refreshToken").value("refresh-token"))
    }

    @Test
    fun `잘못된 토큰으로 갱신 실패`() {
        whenever(adminAuthService.refreshToken("invalid-token"))
            .thenThrow(UnauthorizedAccessException("Invalid refresh token"))

        mockMvc.perform(post("/v1/admin/auth/refresh")
                .header("Authorization", "Bearer invalid-token"))
            .andExpect(status().isUnauthorized)
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.error.message").value("Invalid refresh token"))
    }

    @Test
    fun `토큰 검증 성공`() {
        val adminInfo = AdminInfo(1L, "admin", "ADMIN", "admin@test.com", "Admin User", "team1", "SUBDOMAIN")

        whenever(adminAuthService.getAdminByToken("access-token"))
            .thenReturn(adminInfo)

        mockMvc.perform(get("/v1/admin/auth/verify")
                .header("Authorization", "Bearer access-token"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.username").value("admin"))
    }

    @Test
    fun `잘못된 토큰으로 검증 실패`() {
        whenever(adminAuthService.getAdminByToken("invalid-token"))
            .thenReturn(null)

        mockMvc.perform(get("/v1/admin/auth/verify")
                .header("Authorization", "Bearer invalid-token"))
            .andExpect(status().isUnauthorized)
            .andExpect(jsonPath("$.success").value(false))
    }

    @Test
    fun `로그아웃 성공`() {
        doNothing().whenever(adminAuthService).logout(eq("admin"), any())

        mockMvc.perform(post("/v1/admin/auth/logout")
                .param("username", "admin"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.message").value("Successfully logged out"))

        verify(adminAuthService).logout(eq("admin"), any())
    }
}