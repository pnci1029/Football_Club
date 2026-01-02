package io.be.shared.exception

import io.be.shared.dto.ErrorResponse
import jakarta.servlet.http.HttpServletRequest
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.validation.FieldError
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
class GlobalExceptionHandler {
    
    private val logger = LoggerFactory.getLogger(GlobalExceptionHandler::class.java)
    
    @ExceptionHandler(PlayerNotFoundException::class)
    fun handlePlayerNotFound(ex: PlayerNotFoundException): ResponseEntity<ErrorResponse> {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ErrorResponse("PLAYER_NOT_FOUND", ex.message ?: "Player not found"))
    }
    
    @ExceptionHandler(TeamNotFoundException::class)
    fun handleTeamNotFound(ex: TeamNotFoundException): ResponseEntity<ErrorResponse> {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ErrorResponse("TEAM_NOT_FOUND", ex.message ?: "Team not found"))
    }
    
    @ExceptionHandler(TeamCodeAlreadyExistsException::class)
    fun handleTeamCodeAlreadyExists(ex: TeamCodeAlreadyExistsException): ResponseEntity<ErrorResponse> {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(ErrorResponse("TEAM_CODE_CONFLICT", ex.message ?: "Team code already exists"))
    }
    
    @ExceptionHandler(StadiumNotFoundException::class)
    fun handleStadiumNotFound(ex: StadiumNotFoundException): ResponseEntity<ErrorResponse> {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ErrorResponse("STADIUM_NOT_FOUND", ex.message ?: "Stadium not found"))
    }
    
    @ExceptionHandler(MatchNotFoundException::class)
    fun handleMatchNotFound(ex: MatchNotFoundException): ResponseEntity<ErrorResponse> {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ErrorResponse("MATCH_NOT_FOUND", ex.message ?: "Match not found"))
    }
    
    @ExceptionHandler(InvalidSubdomainException::class)
    fun handleInvalidSubdomain(ex: InvalidSubdomainException): ResponseEntity<ErrorResponse> {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponse("INVALID_SUBDOMAIN", ex.message ?: "Invalid subdomain"))
    }
    
    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidationException(ex: MethodArgumentNotValidException): ResponseEntity<ErrorResponse> {
        val errors = ex.bindingResult.allErrors.joinToString(", ") { error ->
            when (error) {
                is FieldError -> "${error.field}: ${error.defaultMessage}"
                else -> error.defaultMessage ?: "Validation error"
            }
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponse("VALIDATION_ERROR", "Validation failed: $errors"))
    }
    
    // ========================================================================================
    // Business Rule Violations
    // ========================================================================================
    @ExceptionHandler(PlayerAlreadyExistsException::class)
    fun handlePlayerAlreadyExists(ex: PlayerAlreadyExistsException): ResponseEntity<ErrorResponse> {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(ErrorResponse("PLAYER_ALREADY_EXISTS", ex.message ?: "Player already exists"))
    }
    
    @ExceptionHandler(StadiumBookingConflictException::class)
    fun handleStadiumBookingConflict(ex: StadiumBookingConflictException): ResponseEntity<ErrorResponse> {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(ErrorResponse("STADIUM_BOOKING_CONFLICT", ex.message ?: "Stadium booking conflict"))
    }
    
    @ExceptionHandler(InvalidMatchStatusException::class)
    fun handleInvalidMatchStatus(ex: InvalidMatchStatusException): ResponseEntity<ErrorResponse> {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponse("INVALID_MATCH_STATUS", ex.message ?: "Invalid match status"))
    }

    // ========================================================================================
    // Security & Access Control
    // ========================================================================================
    @ExceptionHandler(SubdomainAccessDeniedException::class)
    fun handleSubdomainAccessDenied(ex: SubdomainAccessDeniedException): ResponseEntity<ErrorResponse> {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(ErrorResponse("SUBDOMAIN_ACCESS_DENIED", ex.message ?: "Access denied"))
    }
    
    @ExceptionHandler(UnauthorizedTeamAccessException::class)
    fun handleUnauthorizedTeamAccess(ex: UnauthorizedTeamAccessException): ResponseEntity<ErrorResponse> {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(ErrorResponse("UNAUTHORIZED_TEAM_ACCESS", ex.message ?: "Unauthorized team access"))
    }
    
    @ExceptionHandler(InvalidTenantConfigurationException::class)
    fun handleInvalidTenantConfiguration(ex: InvalidTenantConfigurationException): ResponseEntity<ErrorResponse> {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponse("INVALID_TENANT_CONFIG", ex.message ?: "Invalid tenant configuration"))
    }

    // ========================================================================================
    // File & Upload Exceptions
    // ========================================================================================
    @ExceptionHandler(FileUploadException::class)
    fun handleFileUpload(ex: FileUploadException): ResponseEntity<ErrorResponse> {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponse("FILE_UPLOAD_ERROR", ex.message ?: "File upload failed"))
    }
    
    @ExceptionHandler(UnsupportedFileTypeException::class)
    fun handleUnsupportedFileType(ex: UnsupportedFileTypeException): ResponseEntity<ErrorResponse> {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponse("UNSUPPORTED_FILE_TYPE", ex.message ?: "Unsupported file type"))
    }
    
    @ExceptionHandler(FileSizeLimitExceededException::class)
    fun handleFileSizeLimitExceeded(ex: FileSizeLimitExceededException): ResponseEntity<ErrorResponse> {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
            .body(ErrorResponse("FILE_SIZE_LIMIT_EXCEEDED", ex.message ?: "File size limit exceeded"))
    }
    
    @ExceptionHandler(FileProcessingException::class)
    fun handleFileProcessing(ex: FileProcessingException): ResponseEntity<ErrorResponse> {
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
            .body(ErrorResponse("FILE_PROCESSING_ERROR", ex.message ?: "File processing failed"))
    }

    // ========================================================================================
    // API & Input Validation
    // ========================================================================================
    @ExceptionHandler(InvalidRequestException::class)
    fun handleInvalidRequest(ex: InvalidRequestException): ResponseEntity<ErrorResponse> {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponse("INVALID_REQUEST", ex.message ?: "Invalid request"))
    }
    
    @ExceptionHandler(MissingRequiredFieldException::class)
    fun handleMissingRequiredField(ex: MissingRequiredFieldException): ResponseEntity<ErrorResponse> {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponse("MISSING_REQUIRED_FIELD", ex.message ?: "Missing required field"))
    }
    
    @ExceptionHandler(DuplicateResourceException::class)
    fun handleDuplicateResource(ex: DuplicateResourceException): ResponseEntity<ErrorResponse> {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(ErrorResponse("DUPLICATE_RESOURCE", ex.message ?: "Resource already exists"))
    }

    // ========================================================================================
    // External Service Exceptions
    // ========================================================================================
    @ExceptionHandler(ExternalServiceException::class)
    fun handleExternalService(ex: ExternalServiceException): ResponseEntity<ErrorResponse> {
        logger.warn("External service error: ${ex.message}")
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
            .body(ErrorResponse("EXTERNAL_SERVICE_ERROR", ex.message ?: "External service unavailable"))
    }
    
    @ExceptionHandler(DatabaseConstraintViolationException::class)
    fun handleDatabaseConstraintViolation(ex: DatabaseConstraintViolationException): ResponseEntity<ErrorResponse> {
        logger.warn("Database constraint violation: ${ex.message}")
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(ErrorResponse("DATABASE_CONSTRAINT_VIOLATION", ex.message ?: "Database constraint violation"))
    }

    @ExceptionHandler(RuntimeException::class)
    fun handleRuntimeException(ex: RuntimeException, request: HttpServletRequest): ResponseEntity<ErrorResponse> {
        val method = request.method
        val uri = request.requestURI
        val queryString = request.queryString
        val fullUrl = if (queryString != null) "$uri?$queryString" else uri
        
        logger.error("💥 RUNTIME_ERROR - $method $fullUrl | Error: ${ex.javaClass.simpleName}: ${ex.message}", ex)
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ErrorResponse("INTERNAL_SERVER_ERROR", ex.message ?: "An unexpected error occurred"))
    }
    
    @ExceptionHandler(BadRequestException::class)
    fun handleBadRequest(ex: BadRequestException): ResponseEntity<ErrorResponse> {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponse("BAD_REQUEST", ex.message ?: "Bad request"))
    }
    
    @ExceptionHandler(UnauthorizedException::class)
    fun handleUnauthorized(ex: UnauthorizedException): ResponseEntity<ErrorResponse> {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(ErrorResponse("UNAUTHORIZED", ex.message ?: "Unauthorized"))
    }

    @ExceptionHandler(Exception::class)
    fun handleGenericException(ex: Exception, request: HttpServletRequest): ResponseEntity<ErrorResponse> {
        val method = request.method
        val uri = request.requestURI
        val queryString = request.queryString
        val fullUrl = if (queryString != null) "$uri?$queryString" else uri
        
        logger.error("💥 GENERIC_ERROR - $method $fullUrl | Error: ${ex.javaClass.simpleName}: ${ex.message}", ex)
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ErrorResponse("INTERNAL_SERVER_ERROR", "An unexpected error occurred"))
    }
}