package io.be.shared.util

import java.time.LocalDateTime

data class ApiResponse<T>(
    val success: Boolean,
    val data: T? = null,
    val message: String? = null,
    val error: ErrorDetails? = null,
    val timestamp: LocalDateTime = LocalDateTime.now()
) {
    companion object {
        fun <T> success(data: T, message: String? = null): ApiResponse<T> {
            return ApiResponse(
                success = true,
                data = data,
                message = message
            )
        }
        
        fun <T> error(code: String, message: String, details: String? = null): ApiResponse<T> {
            return ApiResponse(
                success = false,
                error = ErrorDetails(code, message, details)
            )
        }
        
        fun <T> error(message: String): ApiResponse<T> {
            return ApiResponse(
                success = false,
                error = ErrorDetails("ERROR", message, null)
            )
        }
    }
}

data class ErrorDetails(
    val code: String,
    val message: String,
    val details: String? = null
)