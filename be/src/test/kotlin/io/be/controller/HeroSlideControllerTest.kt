package io.be.controller

import io.be.shared.controller.HeroSlideController
import io.be.heroslide.application.HeroSlideService
import io.be.heroslide.dto.HeroSlideDto
import io.be.heroslide.domain.GradientColor
import io.be.shared.service.SubdomainService
import io.be.team.dto.TeamDto
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.BDDMockito.given
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.http.HttpStatus
import java.time.LocalDateTime
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

@ExtendWith(MockitoExtension::class)
class HeroSlideControllerTest {

    @Mock
    private lateinit var heroSlideService: HeroSlideService

    @Mock
    private lateinit var subdomainService: SubdomainService

    @InjectMocks
    private lateinit var heroSlideController: HeroSlideController

    private lateinit var mockRequest: MockHttpServletRequest

    @BeforeEach
    fun setUp() {
        mockRequest = MockHttpServletRequest()
        mockRequest.setServerName("test-team.example.com")
    }

    @Test
    fun `getActiveSlides should return active slides for valid team`() {
        // Given
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
        
        given(subdomainService.extractTeamCodeFromRequest(mockRequest)).willReturn("test-team")
        given(subdomainService.getTeamByCode("test-team")).willReturn(teamDto)
        given(heroSlideService.getActiveSlidesForTeam(1L)).willReturn(listOf(heroSlideDto))

        // When
        val response = heroSlideController.getActiveSlides(mockRequest)

        // Then
        assertEquals(HttpStatus.OK, response.statusCode)
        assertNotNull(response.body)
        assertEquals(true, response.body!!.success)
        assertEquals(1, response.body!!.data?.size)
        assertEquals("Test Slide", response.body!!.data?.get(0)?.title)
    }

    @Test
    fun `getActiveSlides should return error for invalid subdomain`() {
        // Given
        given(subdomainService.extractTeamCodeFromRequest(mockRequest)).willReturn(null)

        // When
        val response = heroSlideController.getActiveSlides(mockRequest)

        // Then
        assertEquals(HttpStatus.BAD_REQUEST, response.statusCode)
        assertNotNull(response.body)
        assertEquals(false, response.body!!.success)
        assertEquals("INVALID_SUBDOMAIN", response.body!!.error?.code)
    }

    @Test
    fun `getActiveSlides should return 404 for non-existent team`() {
        // Given
        given(subdomainService.extractTeamCodeFromRequest(mockRequest)).willReturn("non-existent")
        given(subdomainService.getTeamByCode("non-existent")).willReturn(null)

        // When
        val response = heroSlideController.getActiveSlides(mockRequest)

        // Then
        assertEquals(HttpStatus.NOT_FOUND, response.statusCode)
    }

    // Mock HttpServletRequest class for testing
    class MockHttpServletRequest : jakarta.servlet.http.HttpServletRequest {
        private var _serverName: String = ""
        
        fun setServerName(name: String) {
            _serverName = name
        }
        
        override fun getServerName(): String = _serverName
        
        // Stub implementations for required methods
        override fun getAuthType(): String? = null
        override fun getCookies(): Array<jakarta.servlet.http.Cookie>? = null
        override fun getDateHeader(name: String?): Long = 0L
        override fun getHeader(name: String?): String? = null
        override fun getHeaders(name: String?): java.util.Enumeration<String>? = null
        override fun getHeaderNames(): java.util.Enumeration<String>? = null
        override fun getIntHeader(name: String?): Int = 0
        override fun getMethod(): String = "GET"
        override fun getPathInfo(): String? = null
        override fun getPathTranslated(): String? = null
        override fun getContextPath(): String = ""
        override fun getQueryString(): String? = null
        override fun getRemoteUser(): String? = null
        override fun isUserInRole(role: String?): Boolean = false
        override fun getUserPrincipal(): java.security.Principal? = null
        override fun getRequestedSessionId(): String? = null
        override fun getRequestURI(): String = ""
        override fun getRequestURL(): StringBuffer = StringBuffer()
        override fun getServletPath(): String = ""
        override fun getSession(create: Boolean): jakarta.servlet.http.HttpSession? = null
        override fun getSession(): jakarta.servlet.http.HttpSession? = null
        override fun changeSessionId(): String = ""
        override fun isRequestedSessionIdValid(): Boolean = false
        override fun isRequestedSessionIdFromCookie(): Boolean = false
        override fun isRequestedSessionIdFromURL(): Boolean = false
        override fun authenticate(response: jakarta.servlet.http.HttpServletResponse?): Boolean = false
        override fun login(username: String?, password: String?) {}
        override fun logout() {}
        override fun getParts(): Collection<jakarta.servlet.http.Part>? = null
        override fun getPart(name: String?): jakarta.servlet.http.Part? = null
        override fun <T : jakarta.servlet.http.HttpUpgradeHandler?> upgrade(httpUpgradeHandlerClass: Class<T>?): T? = null
        override fun getAttribute(name: String?): Any? = null
        override fun getAttributeNames(): java.util.Enumeration<String>? = null
        override fun getCharacterEncoding(): String? = null
        override fun setCharacterEncoding(env: String?) {}
        override fun getContentLength(): Int = 0
        override fun getContentLengthLong(): Long = 0L
        override fun getContentType(): String? = null
        override fun getInputStream(): jakarta.servlet.ServletInputStream? = null
        override fun getParameter(name: String?): String? = null
        override fun getParameterNames(): java.util.Enumeration<String>? = null
        override fun getParameterValues(name: String?): Array<String>? = null
        override fun getParameterMap(): MutableMap<String, Array<String>>? = null
        override fun getProtocol(): String = "HTTP/1.1"
        override fun getScheme(): String = "http"
        override fun getServerPort(): Int = 8080
        override fun getReader(): java.io.BufferedReader? = null
        override fun getRemoteAddr(): String = "127.0.0.1"
        override fun getRemoteHost(): String = "localhost"
        override fun setAttribute(name: String?, o: Any?) {}
        override fun removeAttribute(name: String?) {}
        override fun getLocale(): java.util.Locale = java.util.Locale.getDefault()
        override fun getLocales(): java.util.Enumeration<java.util.Locale>? = null
        override fun isSecure(): Boolean = false
        override fun getRequestDispatcher(path: String?): jakarta.servlet.RequestDispatcher? = null
        override fun getLocalName(): String = "localhost"
        override fun getLocalAddr(): String = "127.0.0.1"
        override fun getLocalPort(): Int = 8080
        override fun getRemotePort(): Int = 8080
        override fun getServletContext(): jakarta.servlet.ServletContext? = null
        override fun startAsync(): jakarta.servlet.AsyncContext? = null
        override fun startAsync(servletRequest: jakarta.servlet.ServletRequest?, servletResponse: jakarta.servlet.ServletResponse?): jakarta.servlet.AsyncContext? = null
        override fun isAsyncStarted(): Boolean = false
        override fun isAsyncSupported(): Boolean = false
        override fun getAsyncContext(): jakarta.servlet.AsyncContext? = null
        override fun getDispatcherType(): jakarta.servlet.DispatcherType = jakarta.servlet.DispatcherType.REQUEST
        override fun getRequestId(): String = ""
        override fun getProtocolRequestId(): String = ""
        override fun getServletConnection(): jakarta.servlet.ServletConnection? = null
    }
}