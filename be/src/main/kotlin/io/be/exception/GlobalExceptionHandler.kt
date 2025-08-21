package io.be.exception

import io.be.util.ApiResponse
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.validation.FieldError
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
class GlobalExceptionHandler {
    
    @ExceptionHandler(PlayerNotFoundException::class)
    fun handlePlayerNotFound(ex: PlayerNotFoundException): ResponseEntity<ApiResponse<Nothing>> {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiResponse.error("PLAYER_NOT_FOUND", ex.message ?: "Player not found"))
    }
    
    @ExceptionHandler(TeamNotFoundException::class)
    fun handleTeamNotFound(ex: TeamNotFoundException): ResponseEntity<ApiResponse<Nothing>> {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiResponse.error("TEAM_NOT_FOUND", ex.message ?: "Team not found"))
    }
    
    @ExceptionHandler(TeamCodeAlreadyExistsException::class)
    fun handleTeamCodeAlreadyExists(ex: TeamCodeAlreadyExistsException): ResponseEntity<ApiResponse<Nothing>> {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(ApiResponse.error("TEAM_CODE_CONFLICT", ex.message ?: "Team code already exists"))
    }
    
    @ExceptionHandler(StadiumNotFoundException::class)
    fun handleStadiumNotFound(ex: StadiumNotFoundException): ResponseEntity<ApiResponse<Nothing>> {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiResponse.error("STADIUM_NOT_FOUND", ex.message ?: "Stadium not found"))
    }
    
    @ExceptionHandler(MatchNotFoundException::class)
    fun handleMatchNotFound(ex: MatchNotFoundException): ResponseEntity<ApiResponse<Nothing>> {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiResponse.error("MATCH_NOT_FOUND", ex.message ?: "Match not found"))
    }
    
    @ExceptionHandler(InvalidSubdomainException::class)
    fun handleInvalidSubdomain(ex: InvalidSubdomainException): ResponseEntity<ApiResponse<Nothing>> {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.error("INVALID_SUBDOMAIN", ex.message ?: "Invalid subdomain"))
    }
    
    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidationException(ex: MethodArgumentNotValidException): ResponseEntity<ApiResponse<Nothing>> {
        val errors = ex.bindingResult.allErrors.joinToString(", ") { error ->
            when (error) {
                is FieldError -> "${error.field}: ${error.defaultMessage}"
                else -> error.defaultMessage ?: "Validation error"
            }
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.error("VALIDATION_ERROR", "Validation failed: $errors"))
    }
    
    @ExceptionHandler(RuntimeException::class)
    fun handleRuntimeException(ex: RuntimeException): ResponseEntity<ApiResponse<Nothing>> {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiResponse.error("INTERNAL_SERVER_ERROR", ex.message ?: "An unexpected error occurred"))
    }
    
    @ExceptionHandler(Exception::class)
    fun handleGenericException(ex: Exception): ResponseEntity<ApiResponse<Nothing>> {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiResponse.error("INTERNAL_SERVER_ERROR", "An unexpected error occurred"))
    }
}