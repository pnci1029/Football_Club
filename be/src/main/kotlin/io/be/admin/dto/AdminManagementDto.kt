package io.be.admin.dto

/**
 * 서브도메인 관리자 생성 요청 DTO
 */
data class CreateSubdomainAdminRequest(
    val username: String,
    val password: String,
    val email: String?,
    val name: String?,
    val teamSubdomain: String
)

/**
 * 서브도메인 관리자 수정 요청 DTO
 */
data class UpdateSubdomainAdminRequest(
    val username: String,
    val password: String = "", // 빈 문자열이면 비밀번호 변경 안함
    val email: String?,
    val name: String?,
    val teamSubdomain: String,
    val isActive: Boolean = true
)

/**
 * 관리자 통계 응답 DTO
 */
data class AdminStatsResponse(
    val totalAdmins: Int,
    val masterAdmins: Int,
    val subdomainAdmins: Int,
    val activeAdmins: Int
)