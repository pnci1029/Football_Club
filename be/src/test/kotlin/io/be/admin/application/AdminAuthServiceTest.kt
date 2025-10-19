package io.be.admin.application

import io.be.admin.domain.Admin
import io.be.admin.domain.AdminLevel
import io.be.admin.domain.AdminRepository
import io.be.shared.exception.UnauthorizedAccessException
import io.be.shared.exception.InvalidRequestException
import io.be.shared.security.JwtTokenProvider
import io.be.shared.util.TeamSubdomainExtractor
import jakarta.servlet.http.HttpServletRequest
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.*
import org.springframework.security.crypto.password.PasswordEncoder
import java.time.LocalDateTime
import java.util.*
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

class AdminAuthServiceTest {

    private val adminRepository = mock<AdminRepository>()
    private val passwordEncoder = mock<PasswordEncoder>()
    private val jwtTokenProvider = mock<JwtTokenProvider>()
    private val teamSubdomainExtractor = mock<TeamSubdomainExtractor>()
    private val request = mock<HttpServletRequest>()

    private val adminAuthService = AdminAuthService(
        adminRepository,
        passwordEncoder,
        jwtTokenProvider,
        teamSubdomainExtractor
    )

    @Test
    fun `마스터 관리자 로그인 성공`() {
        val masterAdmin = Admin(
            id = 1L,
            username = "master",
            password = "encodedPassword",
            adminLevel = AdminLevel.MASTER,
            teamSubdomain = null
        )

        whenever(teamSubdomainExtractor.extractFromRequest(request)).thenReturn(null)
        whenever(adminRepository.findByUsernameAndAdminLevelAndIsActive("master", AdminLevel.MASTER, true))
            .thenReturn(masterAdmin)
        whenever(passwordEncoder.matches("password", "encodedPassword")).thenReturn(true)
        whenever(jwtTokenProvider.createAccessToken(1L, "master", "ADMIN")).thenReturn("access-token")
        whenever(jwtTokenProvider.createRefreshToken(1L)).thenReturn("refresh-token")

        val result = adminAuthService.login("master", "password", request, null, "127.0.0.1")

        assertNotNull(result)
        assertEquals("access-token", result.accessToken)
        assertEquals("refresh-token", result.refreshToken)
        assertEquals("master", result.admin.username)
        verify(adminRepository).updateLastLoginTime(eq(1L), any())
    }

    @Test
    fun `서브도메인 관리자 로그인 성공`() {
        val subdomainAdmin = Admin(
            id = 2L,
            username = "team1admin",
            password = "encodedPassword",
            adminLevel = AdminLevel.SUBDOMAIN,
            teamSubdomain = "team1"
        )

        whenever(teamSubdomainExtractor.extractFromRequest(request)).thenReturn("team1")
        whenever(adminRepository.findByUsernameAndTeamSubdomainAndIsActive("team1admin", "team1", true))
            .thenReturn(subdomainAdmin)
        whenever(passwordEncoder.matches("password", "encodedPassword")).thenReturn(true)
        whenever(jwtTokenProvider.createAccessToken(2L, "team1admin", "ADMIN")).thenReturn("access-token")
        whenever(jwtTokenProvider.createRefreshToken(2L)).thenReturn("refresh-token")

        val result = adminAuthService.login("team1admin", "password", request, null, "127.0.0.1")

        assertNotNull(result)
        assertEquals("access-token", result.accessToken)
        assertEquals("team1admin", result.admin.username)
    }

    @Test
    fun `서브도메인 관리자가 다른 서브도메인에서 로그인 시도시 실패`() {
        val subdomainAdmin = Admin(
            id = 2L,
            username = "team1admin",
            password = "encodedPassword",
            adminLevel = AdminLevel.SUBDOMAIN,
            teamSubdomain = "team1"
        )

        whenever(teamSubdomainExtractor.extractFromRequest(request)).thenReturn("team2")
        whenever(adminRepository.findByUsernameAndTeamSubdomainAndIsActive("team1admin", "team2", true))
            .thenReturn(null)
        whenever(adminRepository.findByUsernameAndAdminLevelAndIsActive("team1admin", AdminLevel.MASTER, true))
            .thenReturn(null)

        assertThrows<UnauthorizedAccessException> {
            adminAuthService.login("team1admin", "password", request, null, "127.0.0.1")
        }
    }

    @Test
    fun `잘못된 비밀번호로 로그인 시도시 실패`() {
        val admin = Admin(
            id = 1L,
            username = "master",
            password = "encodedPassword",
            adminLevel = AdminLevel.MASTER
        )

        whenever(teamSubdomainExtractor.extractFromRequest(request)).thenReturn(null)
        whenever(adminRepository.findByUsernameAndAdminLevelAndIsActive("master", AdminLevel.MASTER, true))
            .thenReturn(admin)
        whenever(passwordEncoder.matches("wrongpassword", "encodedPassword")).thenReturn(false)

        assertThrows<UnauthorizedAccessException> {
            adminAuthService.login("master", "wrongpassword", request, null, "127.0.0.1")
        }
    }

    @Test
    fun `빈 사용자명으로 로그인 시도시 실패`() {
        assertThrows<InvalidRequestException> {
            adminAuthService.login("", "password", request, null, "127.0.0.1")
        }
    }

    @Test
    fun `빈 비밀번호로 로그인 시도시 실패`() {
        assertThrows<InvalidRequestException> {
            adminAuthService.login("username", "", request, null, "127.0.0.1")
        }
    }

    @Test
    fun `존재하지 않는 사용자로 로그인 시도시 실패`() {
        whenever(teamSubdomainExtractor.extractFromRequest(request)).thenReturn(null)
        whenever(adminRepository.findByUsernameAndAdminLevelAndIsActive("nonexistent", AdminLevel.MASTER, true))
            .thenReturn(null)

        assertThrows<UnauthorizedAccessException> {
            adminAuthService.login("nonexistent", "password", request, null, "127.0.0.1")
        }
    }

    @Test
    fun `토큰 갱신 성공`() {
        val admin = Admin(
            id = 1L,
            username = "master",
            password = "encodedPassword",
            adminLevel = AdminLevel.MASTER
        )

        whenever(jwtTokenProvider.validateToken("refresh-token")).thenReturn(true)
        whenever(jwtTokenProvider.isRefreshToken("refresh-token")).thenReturn(true)
        whenever(jwtTokenProvider.getAdminIdFromToken("refresh-token")).thenReturn(1L)
        whenever(adminRepository.findById(1L)).thenReturn(Optional.of(admin))
        whenever(jwtTokenProvider.createAccessToken(1L, "master", "ADMIN")).thenReturn("new-access-token")

        val result = adminAuthService.refreshToken("refresh-token")

        assertEquals("new-access-token", result.accessToken)
        assertEquals("refresh-token", result.refreshToken)
    }

    @Test
    fun `잘못된 토큰으로 갱신 시도시 실패`() {
        whenever(jwtTokenProvider.validateToken("invalid-token")).thenReturn(false)

        assertThrows<UnauthorizedAccessException> {
            adminAuthService.refreshToken("invalid-token")
        }
    }

    @Test
    fun `비활성화된 관리자 계정으로 토큰 갱신 시도시 실패`() {
        val inactiveAdmin = Admin(
            id = 1L,
            username = "inactive",
            password = "encodedPassword",
            adminLevel = AdminLevel.MASTER,
            isActive = false
        )

        whenever(jwtTokenProvider.validateToken("refresh-token")).thenReturn(true)
        whenever(jwtTokenProvider.isRefreshToken("refresh-token")).thenReturn(true)
        whenever(jwtTokenProvider.getAdminIdFromToken("refresh-token")).thenReturn(1L)
        whenever(adminRepository.findById(1L)).thenReturn(Optional.of(inactiveAdmin))

        assertThrows<UnauthorizedAccessException> {
            adminAuthService.refreshToken("refresh-token")
        }
    }

    @Test
    fun `teamCode로 로그인 성공`() {
        val subdomainAdmin = Admin(
            id = 2L,
            username = "team1admin",
            password = "encodedPassword",
            adminLevel = AdminLevel.SUBDOMAIN,
            teamSubdomain = "team1"
        )

        whenever(adminRepository.findByUsernameAndTeamSubdomainAndIsActive("team1admin", "team1", true))
            .thenReturn(subdomainAdmin)
        whenever(passwordEncoder.matches("password", "encodedPassword")).thenReturn(true)
        whenever(jwtTokenProvider.createAccessToken(2L, "team1admin", "ADMIN")).thenReturn("access-token")
        whenever(jwtTokenProvider.createRefreshToken(2L)).thenReturn("refresh-token")

        val result = adminAuthService.login("team1admin", "password", request, "team1", "127.0.0.1")

        assertNotNull(result)
        assertEquals("access-token", result.accessToken)
        assertEquals("team1admin", result.admin.username)
    }
}