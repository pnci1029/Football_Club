import io.be.shared.security.*
import io.be.shared.exception.*
package io.be.security

import io.be.team.dto.TeamDto
import io.be.shared.exception.TeamNotFoundException
import io.be.shared.service.SubdomainService
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.*
import org.springframework.http.HttpStatus
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.mock.web.MockHttpServletResponse
import kotlin.test.*

@ExtendWith(MockitoExtension::class)
class TenantSecurityInterceptorTest {

    @Mock
    private lateinit var subdomainService: SubdomainService

    @Mock
    private lateinit var securityEventLogger: SecurityEventLogger

    private lateinit var interceptor: TenantSecurityInterceptor
    private lateinit var request: MockHttpServletRequest
    private lateinit var response: MockHttpServletResponse

    @BeforeEach
    fun setUp() {
        interceptor = TenantSecurityInterceptor(subdomainService, securityEventLogger)
        request = MockHttpServletRequest()
        response = MockHttpServletResponse()
        
        // 테스트 후 컨텍스트 정리
        TenantContextHolder.clear()
    }

    @Test
    fun `should reject request with missing host header`() {
        // given
        request.requestURI = "/api/v1/players"
        // Host 헤더 설정 안함

        // when
        val result = interceptor.preHandle(request, response, Any())

        // then
        assertFalse(result)
        assertEquals(HttpStatus.BAD_REQUEST.value(), response.status)
        verify(securityEventLogger).logSecurityEvent(
            eq(SecurityEvent.MISSING_HOST_HEADER),
            any(),
            any()
        )
    }

    @Test
    fun `should reject request with invalid host header`() {
        // given
        request.addHeader("Host", "malicious-site.com")
        request.requestURI = "/api/v1/players"

        // when
        val result = interceptor.preHandle(request, response, Any())

        // then
        assertFalse(result)
        assertEquals(HttpStatus.FORBIDDEN.value(), response.status)
        verify(securityEventLogger).logSecurityEvent(
            eq(SecurityEvent.INVALID_HOST_HEADER),
            any(),
            any()
        )
    }

    @Test
    fun `should allow localhost requests`() {
        // given
        request.addHeader("Host", "localhost:3000")
        request.requestURI = "/api/v1/teams"

        // when
        val result = interceptor.preHandle(request, response, Any())

        // then
        org.junit.jupiter.api.Assertions.assertTrue(result)
        assertEquals(HttpStatus.OK.value(), response.status)
    }

    @Test
    fun `should allow admin domain access to admin endpoints`() {
        // given
        request.addHeader("Host", "admin.localhost:3000")
        request.requestURI = "/api/admin/players"

        // when
        val result = interceptor.preHandle(request, response, Any())

        // then
        org.junit.jupiter.api.Assertions.assertTrue(result)
    }

    @Test
    fun `should reject admin domain access to non-admin endpoints`() {
        // given
        request.addHeader("Host", "admin.localhost:3000")
        request.requestURI = "/api/v1/players"

        // when
        val result = interceptor.preHandle(request, response, Any())

        // then
        assertFalse(result)
        assertEquals(HttpStatus.FORBIDDEN.value(), response.status)
        verify(securityEventLogger).logSecurityEvent(
            eq(SecurityEvent.UNAUTHORIZED_ADMIN_ACCESS),
            any(),
            any()
        )
    }

    @Test
    fun `should set tenant context for valid subdomain`() {
        // given
        val teamDto = mockTeamDto()
        request.addHeader("Host", "barcelona.localhost:3000")
        request.requestURI = "/api/v1/players"
        
        whenever(subdomainService.getTeamByCode("barcelona"))
            .thenReturn(teamDto)

        // when
        val result = interceptor.preHandle(request, response, Any())

        // then
        org.junit.jupiter.api.Assertions.assertTrue(result)
        org.junit.jupiter.api.Assertions.assertTrue(TenantContextHolder.hasContext())
        assertEquals(1L, TenantContextHolder.getTeamId())
        assertEquals("barcelona", TenantContextHolder.getSubdomain())
        assertEquals("FC Barcelona", TenantContextHolder.getTeamName())
    }

    @Test
    fun `should reject unknown subdomain`() {
        // given
        request.addHeader("Host", "unknown.localhost:3000")
        request.requestURI = "/api/v1/players"
        
        whenever(subdomainService.getTeamByCode("unknown"))
            .thenThrow(TeamNotFoundException("unknown"))

        // when
        val result = interceptor.preHandle(request, response, Any())

        // then
        assertFalse(result)
        assertEquals(HttpStatus.NOT_FOUND.value(), response.status)
        verify(securityEventLogger).logSecurityEvent(
            eq(SecurityEvent.UNKNOWN_SUBDOMAIN_ACCESS),
            any(),
            any()
        )
    }

    @Test
    fun `should reject tenant subdomain access to admin endpoints`() {
        // given
        val teamDto = mockTeamDto()
        request.addHeader("Host", "barcelona.localhost:3000")
        request.requestURI = "/api/admin/players"
        
        whenever(subdomainService.getTeamByCode("barcelona"))
            .thenReturn(teamDto)

        // when
        var exceptionThrown = false
        try {
            val result = interceptor.preHandle(request, response, Any())
            assertFalse(result) // If no exception, at least it should return false
        } catch (e: io.be.shared.exception.SubdomainAccessDeniedException) {
            exceptionThrown = true
            // This is the expected behavior
        }

        // then - either exception thrown or false returned
        org.junit.jupiter.api.Assertions.assertTrue(exceptionThrown || response.status != HttpStatus.OK.value())
        
        verify(securityEventLogger).logSecurityEvent(
            eq(SecurityEvent.TENANT_ADMIN_ACCESS_ATTEMPT),
            any(),
            any()
        )
    }

    @Test
    fun `should clear tenant context after request completion`() {
        // given
        val teamDto = mockTeamDto()
        request.addHeader("Host", "barcelona.localhost:3000")
        request.requestURI = "/api/v1/players"
        
        whenever(subdomainService.getTeamByCode("barcelona"))
            .thenReturn(teamDto)

        // when
        interceptor.preHandle(request, response, Any())
        org.junit.jupiter.api.Assertions.assertTrue(TenantContextHolder.hasContext()) // 컨텍스트 설정됨
        
        interceptor.afterCompletion(request, response, Any(), null)

        // then
        assertFalse(TenantContextHolder.hasContext()) // 컨텍스트 정리됨
    }

    @Test
    fun `should handle production domains correctly`() {
        // given
        val teamDto = mockTeamDto()
        request.addHeader("Host", "barcelona.football-club.kr")
        request.requestURI = "/api/v1/players"
        
        whenever(subdomainService.getTeamByCode("barcelona"))
            .thenReturn(teamDto)

        // when
        val result = interceptor.preHandle(request, response, Any())

        // then
        org.junit.jupiter.api.Assertions.assertTrue(result)
        org.junit.jupiter.api.Assertions.assertTrue(TenantContextHolder.hasContext())
        assertEquals("barcelona", TenantContextHolder.getSubdomain())
    }

    private fun mockTeamDto() = TeamDto(
        id = 1L,
        code = "barcelona",
        name = "FC Barcelona",
        description = "Football Club Barcelona",
        logoUrl = null
    )
}