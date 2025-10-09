package io.be.stadium.presentation

import io.be.shared.controller.StadiumController
import io.be.stadium.dto.StadiumDto
import io.be.stadium.application.StadiumService
import io.be.shared.service.SubdomainService
import io.be.team.dto.TeamDto
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.BDDMockito.given
import org.mockito.kotlin.any
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import org.springframework.http.HttpStatus
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

@ExtendWith(MockitoExtension::class)
class StadiumControllerTest {

    @Mock
    private lateinit var stadiumService: StadiumService
    
    @Mock
    private lateinit var subdomainService: SubdomainService

    @InjectMocks
    private lateinit var stadiumController: StadiumController

    private lateinit var mockRequest: MockHttpServletRequest

    @BeforeEach
    fun setUp() {
        mockRequest = MockHttpServletRequest()
        mockRequest.setServerName("test-team.example.com")
    }

    @Test
    fun `getAllStadiums should return paginated stadiums`() {
        // Given
        val stadiumDto = StadiumDto(1L, "Test Stadium", "Test Address", 37.5665, 126.9780, 1L, "Test Team", listOf("Test facilities"), 50000, "09:00-22:00", listOf("월", "화", "수", "목", "금"), "010-1234-5678", listOf("image1.jpg"))
        val page = PageImpl(listOf(stadiumDto), PageRequest.of(0, 10), 1)
        
        given(subdomainService.extractTeamCodeFromRequest(mockRequest)).willReturn(null)
        given(stadiumService.findAllStadiums(any())).willReturn(page)

        // When
        val response = stadiumController.getAllStadiums(0, 10, mockRequest)

        // Then
        assertEquals(HttpStatus.OK, response.statusCode)
        assertNotNull(response.body)
        assertEquals(true, response.body!!.success)
    }

    @Test
    fun `getStadium should return stadium when found`() {
        // Given
        val stadiumDto = StadiumDto(1L, "Test Stadium", "Test Address", 37.5665, 126.9780, 1L, "Test Team", listOf("Test facilities"), 50000, "09:00-22:00", listOf("월", "화", "수", "목", "금"), "010-1234-5678", listOf("image1.jpg"))
        
        given(stadiumService.findStadiumById(1L)).willReturn(stadiumDto)

        // When
        val response = stadiumController.getStadium(1L)

        // Then
        assertEquals(HttpStatus.OK, response.statusCode)
        assertNotNull(response.body)
        assertEquals(true, response.body!!.success)
        assertEquals(1L, response.body!!.data?.id)
    }

    @Test
    fun `getStadium should return 404 when not found`() {
        // Given
        given(stadiumService.findStadiumById(1L)).willReturn(null)

        // When
        val response = stadiumController.getStadium(1L)

        // Then
        assertEquals(HttpStatus.NOT_FOUND, response.statusCode)
    }

    @Test
    fun `searchStadiums should return stadiums by name`() {
        // Given
        val stadiumDto = StadiumDto(1L, "Test Stadium", "Test Address", 37.5665, 126.9780, 1L, "Test Team", listOf("Test facilities"), 50000, "09:00-22:00", listOf("월", "화", "수", "목", "금"), "010-1234-5678", listOf("image1.jpg"))
        
        given(stadiumService.searchStadiumsByName("Test")).willReturn(listOf(stadiumDto))

        // When
        val response = stadiumController.searchStadiums("Test", null)

        // Then
        assertEquals(HttpStatus.OK, response.statusCode)
        assertNotNull(response.body)
        assertEquals(true, response.body!!.success)
        assertEquals("Test Stadium", response.body!!.data?.get(0)?.name)
    }

    @Test
    fun `searchStadiums should return stadiums by address`() {
        // Given
        val stadiumDto = StadiumDto(1L, "Test Stadium", "Test Address", 37.5665, 126.9780, 1L, "Test Team", listOf("Test facilities"), 50000, "09:00-22:00", listOf("월", "화", "수", "목", "금"), "010-1234-5678", listOf("image1.jpg"))
        
        given(stadiumService.searchStadiumsByAddress("Test Address")).willReturn(listOf(stadiumDto))

        // When
        val response = stadiumController.searchStadiums(null, "Test Address")

        // Then
        assertEquals(HttpStatus.OK, response.statusCode)
        assertNotNull(response.body)
        assertEquals(true, response.body!!.success)
        assertEquals("Test Address", response.body!!.data?.get(0)?.address)
    }

    @Test
    fun `searchStadiums should return empty list when no parameters`() {
        // When
        val response = stadiumController.searchStadiums(null, null)

        // Then
        assertEquals(HttpStatus.OK, response.statusCode)
        assertNotNull(response.body)
        assertEquals(true, response.body!!.success)
        assertEquals(0, response.body!!.data?.size)
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