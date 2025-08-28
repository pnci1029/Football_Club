package io.be.exception

import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.http.HttpStatus
import org.springframework.validation.BindingResult
import org.springframework.validation.FieldError
import org.springframework.web.bind.MethodArgumentNotValidException
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotNull

class GlobalExceptionHandlerTest {

    private lateinit var exceptionHandler: GlobalExceptionHandler

    @BeforeEach
    fun setUp() {
        exceptionHandler = GlobalExceptionHandler()
    }

    @Test
    fun `should handle PlayerNotFoundException correctly`() {
        // given
        val exception = PlayerNotFoundException(1L)

        // when
        val response = exceptionHandler.handlePlayerNotFound(exception)

        // then
        assertEquals(HttpStatus.NOT_FOUND, response.statusCode)
        assertNotNull(response.body)
        assertFalse(response.body!!.success)
        assertEquals("PLAYER_NOT_FOUND", response.body!!.error?.code)
        assertEquals("Player not found with id: 1", response.body!!.error?.message)
    }

    @Test
    fun `should handle TeamNotFoundException correctly`() {
        // given
        val exception = TeamNotFoundException(1L)

        // when
        val response = exceptionHandler.handleTeamNotFound(exception)

        // then
        assertEquals(HttpStatus.NOT_FOUND, response.statusCode)
        assertNotNull(response.body)
        assertFalse(response.body!!.success)
        assertEquals("TEAM_NOT_FOUND", response.body!!.error?.code)
        assertEquals("Team not found with id: 1", response.body!!.error?.message)
    }

    @Test
    fun `should handle TeamCodeAlreadyExistsException correctly`() {
        // given
        val exception = TeamCodeAlreadyExistsException("barcelona")

        // when
        val response = exceptionHandler.handleTeamCodeAlreadyExists(exception)

        // then
        assertEquals(HttpStatus.CONFLICT, response.statusCode)
        assertNotNull(response.body)
        assertFalse(response.body!!.success)
        assertEquals("TEAM_CODE_CONFLICT", response.body!!.error?.code)
        assertEquals("Team with code 'barcelona' already exists", response.body!!.error?.message)
    }

    @Test
    fun `should handle StadiumNotFoundException correctly`() {
        // given
        val exception = StadiumNotFoundException(1L)

        // when
        val response = exceptionHandler.handleStadiumNotFound(exception)

        // then
        assertEquals(HttpStatus.NOT_FOUND, response.statusCode)
        assertNotNull(response.body)
        assertFalse(response.body!!.success)
        assertEquals("STADIUM_NOT_FOUND", response.body!!.error?.code)
        assertEquals("Stadium not found with id: 1", response.body!!.error?.message)
    }

    @Test
    fun `should handle MatchNotFoundException correctly`() {
        // given
        val exception = MatchNotFoundException(1L)

        // when
        val response = exceptionHandler.handleMatchNotFound(exception)

        // then
        assertEquals(HttpStatus.NOT_FOUND, response.statusCode)
        assertNotNull(response.body)
        assertFalse(response.body!!.success)
        assertEquals("MATCH_NOT_FOUND", response.body!!.error?.code)
        assertEquals("Match not found with id: 1", response.body!!.error?.message)
    }

    @Test
    fun `should handle InvalidSubdomainException correctly`() {
        // given
        val exception = InvalidSubdomainException("invalid-domain.com")

        // when
        val response = exceptionHandler.handleInvalidSubdomain(exception)

        // then
        assertEquals(HttpStatus.BAD_REQUEST, response.statusCode)
        assertNotNull(response.body)
        assertFalse(response.body!!.success)
        assertEquals("INVALID_SUBDOMAIN", response.body!!.error?.code)
        assertEquals("Invalid subdomain: invalid-domain.com", response.body!!.error?.message)
    }

    @Test
    fun `should handle MethodArgumentNotValidException correctly`() {
        // given
        val bindingResult = mock<BindingResult>()
        val fieldError = FieldError("objectName", "fieldName", "must not be null")
        whenever(bindingResult.allErrors).thenReturn(listOf(fieldError))
        
        val exception = MethodArgumentNotValidException(mock(), bindingResult)

        // when
        val response = exceptionHandler.handleValidationException(exception)

        // then
        assertEquals(HttpStatus.BAD_REQUEST, response.statusCode)
        assertNotNull(response.body)
        assertFalse(response.body!!.success)
        assertEquals("VALIDATION_ERROR", response.body!!.error?.code)
        assertEquals("Validation failed: fieldName: must not be null", response.body!!.error?.message)
    }

    @Test
    fun `should handle PlayerAlreadyExistsException correctly`() {
        // given
        val exception = PlayerAlreadyExistsException("Messi", 1L)

        // when
        val response = exceptionHandler.handlePlayerAlreadyExists(exception)

        // then
        assertEquals(HttpStatus.CONFLICT, response.statusCode)
        assertNotNull(response.body)
        assertFalse(response.body!!.success)
        assertEquals("PLAYER_ALREADY_EXISTS", response.body!!.error?.code)
        assertEquals("Player 'Messi' already exists in team 1", response.body!!.error?.message)
    }

    @Test
    fun `should handle StadiumBookingConflictException correctly`() {
        // given
        val exception = StadiumBookingConflictException("Camp Nou", "2023-12-25 15:00")

        // when
        val response = exceptionHandler.handleStadiumBookingConflict(exception)

        // then
        assertEquals(HttpStatus.CONFLICT, response.statusCode)
        assertNotNull(response.body)
        assertFalse(response.body!!.success)
        assertEquals("STADIUM_BOOKING_CONFLICT", response.body!!.error?.code)
        assertEquals("Stadium 'Camp Nou' is already booked at 2023-12-25 15:00", response.body!!.error?.message)
    }

    @Test
    fun `should handle InvalidMatchStatusException correctly`() {
        // given
        val exception = InvalidMatchStatusException("FINISHED", "update score")

        // when
        val response = exceptionHandler.handleInvalidMatchStatus(exception)

        // then
        assertEquals(HttpStatus.BAD_REQUEST, response.statusCode)
        assertNotNull(response.body)
        assertFalse(response.body!!.success)
        assertEquals("INVALID_MATCH_STATUS", response.body!!.error?.code)
        assertEquals("Cannot update score match in status: FINISHED", response.body!!.error?.message)
    }

    @Test
    fun `should handle SubdomainAccessDeniedException correctly`() {
        // given
        val exception = SubdomainAccessDeniedException("barcelona", "/admin")

        // when
        val response = exceptionHandler.handleSubdomainAccessDenied(exception)

        // then
        assertEquals(HttpStatus.FORBIDDEN, response.statusCode)
        assertNotNull(response.body)
        assertFalse(response.body!!.success)
        assertEquals("SUBDOMAIN_ACCESS_DENIED", response.body!!.error?.code)
        assertEquals("Access denied to /admin from subdomain: barcelona", response.body!!.error?.message)
    }

    @Test
    fun `should handle UnauthorizedTeamAccessException correctly`() {
        // given
        val exception = UnauthorizedTeamAccessException(1L, 2L)

        // when
        val response = exceptionHandler.handleUnauthorizedTeamAccess(exception)

        // then
        assertEquals(HttpStatus.FORBIDDEN, response.statusCode)
        assertNotNull(response.body)
        assertFalse(response.body!!.success)
        assertEquals("UNAUTHORIZED_TEAM_ACCESS", response.body!!.error?.code)
        assertEquals("Unauthorized access to team 1 by user from team 2", response.body!!.error?.message)
    }

    @Test
    fun `should handle FileUploadException correctly`() {
        // given
        val exception = FileUploadException("File too large")

        // when
        val response = exceptionHandler.handleFileUpload(exception)

        // then
        assertEquals(HttpStatus.BAD_REQUEST, response.statusCode)
        assertNotNull(response.body)
        assertFalse(response.body!!.success)
        assertEquals("FILE_UPLOAD_ERROR", response.body!!.error?.code)
        assertEquals("File upload failed: File too large", response.body!!.error?.message)
    }

    @Test
    fun `should handle UnsupportedFileTypeException correctly`() {
        // given
        val exception = UnsupportedFileTypeException("pdf", listOf("jpg", "png"))

        // when
        val response = exceptionHandler.handleUnsupportedFileType(exception)

        // then
        assertEquals(HttpStatus.BAD_REQUEST, response.statusCode)
        assertNotNull(response.body)
        assertFalse(response.body!!.success)
        assertEquals("UNSUPPORTED_FILE_TYPE", response.body!!.error?.code)
        assertEquals("Unsupported file type 'pdf'. Allowed types: jpg, png", response.body!!.error?.message)
    }

    @Test
    fun `should handle FileSizeLimitExceededException correctly`() {
        // given
        val exception = FileSizeLimitExceededException(10000L, 5000L)

        // when
        val response = exceptionHandler.handleFileSizeLimitExceeded(exception)

        // then
        assertEquals(HttpStatus.PAYLOAD_TOO_LARGE, response.statusCode)
        assertNotNull(response.body)
        assertFalse(response.body!!.success)
        assertEquals("FILE_SIZE_LIMIT_EXCEEDED", response.body!!.error?.code)
        assertEquals("File size 10000 bytes exceeds maximum allowed size 5000 bytes", response.body!!.error?.message)
    }

    @Test
    fun `should handle InvalidRequestException correctly`() {
        // given
        val exception = InvalidRequestException("age", "-5", "must be positive")

        // when
        val response = exceptionHandler.handleInvalidRequest(exception)

        // then
        assertEquals(HttpStatus.BAD_REQUEST, response.statusCode)
        assertNotNull(response.body)
        assertFalse(response.body!!.success)
        assertEquals("INVALID_REQUEST", response.body!!.error?.code)
        assertEquals("Invalid value '-5' for field 'age': must be positive", response.body!!.error?.message)
    }

    @Test
    fun `should handle DuplicateResourceException correctly`() {
        // given
        val exception = DuplicateResourceException("Player", "messi@barcelona.com")

        // when
        val response = exceptionHandler.handleDuplicateResource(exception)

        // then
        assertEquals(HttpStatus.CONFLICT, response.statusCode)
        assertNotNull(response.body)
        assertFalse(response.body!!.success)
        assertEquals("DUPLICATE_RESOURCE", response.body!!.error?.code)
        assertEquals("Player with identifier 'messi@barcelona.com' already exists", response.body!!.error?.message)
    }
}