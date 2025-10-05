package io.be.shared.exception

// ========================================================================================
// Entity Not Found Exceptions
// ========================================================================================
class PlayerNotFoundException : RuntimeException {
    constructor(id: Long) : super("Player not found with id: $id")
    constructor(name: String, teamId: Long) : super("Player '$name' not found in team $teamId")
}

class TeamNotFoundException : RuntimeException {
    constructor(id: Long) : super("Team not found with id: $id")
    constructor(code: String) : super("Team not found with code: $code")
}

class StadiumNotFoundException(id: Long) : RuntimeException("Stadium not found with id: $id")
class MatchNotFoundException(id: Long) : RuntimeException("Match not found with id: $id")
class InquiryNotFoundException(id: Long) : RuntimeException("Inquiry not found with id: $id")
class ResourceNotFoundException(message: String) : RuntimeException(message)

// ========================================================================================
// Business Rule Violations
// ========================================================================================
class TeamCodeAlreadyExistsException(code: String) : RuntimeException("Team with code '$code' already exists")
class PlayerAlreadyExistsException(name: String, teamId: Long) : RuntimeException("Player '$name' already exists in team $teamId")
class StadiumBookingConflictException(stadiumName: String, dateTime: String) : RuntimeException("Stadium '$stadiumName' is already booked at $dateTime")
class InvalidMatchStatusException(currentStatus: String, requestedAction: String) : RuntimeException("Cannot $requestedAction match in status: $currentStatus")

// ========================================================================================
// Security & Access Control
// ========================================================================================
class InvalidSubdomainException(host: String) : RuntimeException("Invalid subdomain: $host")
class SubdomainAccessDeniedException(subdomain: String, resource: String) : RuntimeException("Access denied to $resource from subdomain: $subdomain")
class UnauthorizedTeamAccessException(requestedTeamId: Long, userTeamId: Long) : RuntimeException("Unauthorized access to team $requestedTeamId by user from team $userTeamId")
class InvalidTenantConfigurationException(teamId: Long, issue: String) : RuntimeException("Invalid tenant configuration for team $teamId: $issue")
class UnauthorizedAccessException(message: String = "Unauthorized access") : RuntimeException(message)
class InvalidTokenException(message: String = "Invalid token") : RuntimeException(message)

// ========================================================================================
// File & Upload Exceptions
// ========================================================================================
class FileUploadException(message: String) : RuntimeException("File upload failed: $message")
class UnsupportedFileTypeException(fileType: String, allowedTypes: List<String>) : RuntimeException("Unsupported file type '$fileType'. Allowed types: ${allowedTypes.joinToString(", ")}")
class FileSizeLimitExceededException(actualSize: Long, maxSize: Long) : RuntimeException("File size $actualSize bytes exceeds maximum allowed size $maxSize bytes")
class FileProcessingException(fileName: String, reason: String) : RuntimeException("Failed to process file '$fileName': $reason")

// ========================================================================================
// API & Input Validation
// ========================================================================================
class InvalidRequestException(field: String, value: String, reason: String) : RuntimeException("Invalid value '$value' for field '$field': $reason")
class MissingRequiredFieldException(fieldName: String) : RuntimeException("Required field '$fieldName' is missing")
class DuplicateResourceException(resourceType: String, identifier: String) : RuntimeException("$resourceType with identifier '$identifier' already exists")

// ========================================================================================
// External Service Exceptions
// ========================================================================================
class ExternalServiceException(serviceName: String, message: String) : RuntimeException("External service '$serviceName' error: $message")
class DatabaseConstraintViolationException(constraint: String, details: String) : RuntimeException("Database constraint '$constraint' violated: $details")