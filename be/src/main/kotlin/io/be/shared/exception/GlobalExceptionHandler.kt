package io.be.shared.exception

import io.be.shared.util.ApiResponse
import jakarta.servlet.http.HttpServletRequest
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.validation.FieldError
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
class GlobalExceptionHandler {
    
    private val logger = LoggerFactory.getLogger(GlobalExceptionHandler::class.java)
    
    @ExceptionHandler(PlayerNotFoundException::class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    fun handlePlayerNotFound(ex: PlayerNotFoundException): ApiResponse<Nothing> {
        return ApiResponse.error("PLAYER_NOT_FOUND", ex.message ?: "Player not found")
    }
    
    @ExceptionHandler(TeamNotFoundException::class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    fun handleTeamNotFound(ex: TeamNotFoundException): ApiResponse<Nothing> {
        return ApiResponse.error("TEAM_NOT_FOUND", ex.message ?: "Team not found")
    }
    
    @ExceptionHandler(TeamCodeAlreadyExistsException::class)
    @ResponseStatus(HttpStatus.CONFLICT)
    fun handleTeamCodeAlreadyExists(ex: TeamCodeAlreadyExistsException): ApiResponse<Nothing> {
        return ApiResponse.error("TEAM_CODE_CONFLICT", ex.message ?: "Team code already exists")
    }
    
    @ExceptionHandler(StadiumNotFoundException::class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    fun handleStadiumNotFound(ex: StadiumNotFoundException): ApiResponse<Nothing> {
        return ApiResponse.error("STADIUM_NOT_FOUND", ex.message ?: "Stadium not found")
    }
    
    @ExceptionHandler(MatchNotFoundException::class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    fun handleMatchNotFound(ex: MatchNotFoundException): ApiResponse<Nothing> {
        return ApiResponse.error("MATCH_NOT_FOUND", ex.message ?: "Match not found")
    }
    
    @ExceptionHandler(InvalidSubdomainException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleInvalidSubdomain(ex: InvalidSubdomainException): ApiResponse<Nothing> {
        return ApiResponse.error("INVALID_SUBDOMAIN", ex.message ?: "Invalid subdomain")
    }
    
    @ExceptionHandler(MethodArgumentNotValidException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleValidationException(ex: MethodArgumentNotValidException): ApiResponse<Nothing> {
        val errors = ex.bindingResult.allErrors.joinToString(", ") { error ->
            when (error) {
                is FieldError -> "${error.field}: ${error.defaultMessage}"
                else -> error.defaultMessage ?: "Validation error"
            }
        }
        return ApiResponse.error("VALIDATION_ERROR", "Validation failed: $errors")
    }
    
    // ========================================================================================
    // Business Rule Violations
    // ========================================================================================
    @ExceptionHandler(PlayerAlreadyExistsException::class)
    @ResponseStatus(HttpStatus.CONFLICT)
    fun handlePlayerAlreadyExists(ex: PlayerAlreadyExistsException): ApiResponse<Nothing> {
        return ApiResponse.error("PLAYER_ALREADY_EXISTS", ex.message ?: "Player already exists")
    }
    
    @ExceptionHandler(StadiumBookingConflictException::class)
    @ResponseStatus(HttpStatus.CONFLICT)
    fun handleStadiumBookingConflict(ex: StadiumBookingConflictException): ApiResponse<Nothing> {
        return ApiResponse.error("STADIUM_BOOKING_CONFLICT", ex.message ?: "Stadium booking conflict")
    }
    
    @ExceptionHandler(InvalidMatchStatusException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleInvalidMatchStatus(ex: InvalidMatchStatusException): ApiResponse<Nothing> {
        return ApiResponse.error("INVALID_MATCH_STATUS", ex.message ?: "Invalid match status")
    }

    // ========================================================================================
    // Security & Access Control
    // ========================================================================================
    @ExceptionHandler(SubdomainAccessDeniedException::class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    fun handleSubdomainAccessDenied(ex: SubdomainAccessDeniedException): ApiResponse<Nothing> {
        return ApiResponse.error("SUBDOMAIN_ACCESS_DENIED", ex.message ?: "Access denied")
    }
    
    @ExceptionHandler(UnauthorizedTeamAccessException::class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    fun handleUnauthorizedTeamAccess(ex: UnauthorizedTeamAccessException): ApiResponse<Nothing> {
        return ApiResponse.error("UNAUTHORIZED_TEAM_ACCESS", ex.message ?: "Unauthorized team access")
    }
    
    @ExceptionHandler(InvalidTenantConfigurationException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleInvalidTenantConfiguration(ex: InvalidTenantConfigurationException): ApiResponse<Nothing> {
        return ApiResponse.error("INVALID_TENANT_CONFIG", ex.message ?: "Invalid tenant configuration")
    }

    // ========================================================================================
    // File & Upload Exceptions
    // ========================================================================================
    @ExceptionHandler(FileUploadException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleFileUpload(ex: FileUploadException): ApiResponse<Nothing> {
        return ApiResponse.error("FILE_UPLOAD_ERROR", ex.message ?: "File upload failed")
    }
    
    @ExceptionHandler(UnsupportedFileTypeException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleUnsupportedFileType(ex: UnsupportedFileTypeException): ApiResponse<Nothing> {
        return ApiResponse.error("UNSUPPORTED_FILE_TYPE", ex.message ?: "Unsupported file type")
    }
    
    @ExceptionHandler(FileSizeLimitExceededException::class)
    @ResponseStatus(HttpStatus.PAYLOAD_TOO_LARGE)
    fun handleFileSizeLimitExceeded(ex: FileSizeLimitExceededException): ApiResponse<Nothing> {
        return ApiResponse.error("FILE_SIZE_LIMIT_EXCEEDED", ex.message ?: "File size limit exceeded")
    }
    
    @ExceptionHandler(FileProcessingException::class)
    @ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
    fun handleFileProcessing(ex: FileProcessingException): ApiResponse<Nothing> {
        return ApiResponse.error("FILE_PROCESSING_ERROR", ex.message ?: "File processing failed")
    }

    // ========================================================================================
    // API & Input Validation
    // ========================================================================================
    @ExceptionHandler(InvalidRequestException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleInvalidRequest(ex: InvalidRequestException): ApiResponse<Nothing> {
        return ApiResponse.error("INVALID_REQUEST", ex.message ?: "Invalid request")
    }
    
    @ExceptionHandler(MissingRequiredFieldException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleMissingRequiredField(ex: MissingRequiredFieldException): ApiResponse<Nothing> {
        return ApiResponse.error("MISSING_REQUIRED_FIELD", ex.message ?: "Missing required field")
    }
    
    @ExceptionHandler(DuplicateResourceException::class)
    @ResponseStatus(HttpStatus.CONFLICT)
    fun handleDuplicateResource(ex: DuplicateResourceException): ApiResponse<Nothing> {
        return ApiResponse.error("DUPLICATE_RESOURCE", ex.message ?: "Resource already exists")
    }

    // ========================================================================================
    // External Service Exceptions
    // ========================================================================================
    @ExceptionHandler(ExternalServiceException::class)
    @ResponseStatus(HttpStatus.BAD_GATEWAY)
    fun handleExternalService(ex: ExternalServiceException): ApiResponse<Nothing> {
        logger.warn("External service error: ${ex.message}")
        return ApiResponse.error("EXTERNAL_SERVICE_ERROR", ex.message ?: "External service unavailable")
    }
    
    @ExceptionHandler(DatabaseConstraintViolationException::class)
    @ResponseStatus(HttpStatus.CONFLICT)
    fun handleDatabaseConstraintViolation(ex: DatabaseConstraintViolationException): ApiResponse<Nothing> {
        logger.warn("Database constraint violation: ${ex.message}")
        return ApiResponse.error("DATABASE_CONSTRAINT_VIOLATION", ex.message ?: "Database constraint violation")
    }

    @ExceptionHandler(RuntimeException::class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    fun handleRuntimeException(ex: RuntimeException, request: HttpServletRequest): ApiResponse<Nothing> {
        val method = request.method
        val uri = request.requestURI
        val queryString = request.queryString
        val fullUrl = if (queryString != null) "$uri?$queryString" else uri
        
        logger.error("💥 RUNTIME_ERROR - $method $fullUrl | Error: ${ex.javaClass.simpleName}: ${ex.message}", ex)
        
        return ApiResponse.error("INTERNAL_SERVER_ERROR", ex.message ?: "An unexpected error occurred")
    }
    
    @ExceptionHandler(BadRequestException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleBadRequest(ex: BadRequestException): ApiResponse<Nothing> {
        return ApiResponse.error("BAD_REQUEST", ex.message ?: "Bad request")
    }
    
    @ExceptionHandler(UnauthorizedException::class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    fun handleUnauthorized(ex: UnauthorizedException): ApiResponse<Nothing> {
        return ApiResponse.error("UNAUTHORIZED", ex.message ?: "Unauthorized")
    }

    @ExceptionHandler(Exception::class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    fun handleGenericException(ex: Exception, request: HttpServletRequest): ApiResponse<Nothing> {
        val method = request.method
        val uri = request.requestURI
        val queryString = request.queryString
        val fullUrl = if (queryString != null) "$uri?$queryString" else uri
        
        logger.error("💥 GENERIC_ERROR - $method $fullUrl | Error: ${ex.javaClass.simpleName}: ${ex.message}", ex)
        
        return ApiResponse.error("INTERNAL_SERVER_ERROR", "An unexpected error occurred")
    }
}