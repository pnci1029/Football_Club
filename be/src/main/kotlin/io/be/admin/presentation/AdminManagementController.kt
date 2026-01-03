package io.be.admin.presentation

import io.be.admin.application.AdminManagementService
import io.be.admin.dto.AdminBasicInfo
import io.be.admin.dto.ChangePasswordRequest
import io.be.admin.dto.CreateAdminRequest
import io.be.shared.util.ApiResponse
import jakarta.validation.Valid
import org.springframework.data.domain.Page
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v1/admin/management")
@CrossOrigin(origins = ["*"])
class AdminManagementController(
    private val adminManagementService: AdminManagementService
) {

    @GetMapping("/admins")
    @PreAuthorize("hasAnyRole('MASTER', 'SUPER_ADMIN')")
    fun getAdmins(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(required = false) teamId: Long?
    ): ApiResponse<Page<AdminBasicInfo>> {
        val admins = if (teamId != null) {
            adminManagementService.getAdminsByTeam(teamId, page, size)
        } else {
            adminManagementService.getAllAdmins(page, size)
        }
        return ApiResponse.success(admins)
    }

    @PostMapping("/admins")
    @PreAuthorize("hasAnyRole('MASTER', 'SUPER_ADMIN')")
    fun createAdmin(@RequestBody request: CreateAdminRequest): ApiResponse<AdminBasicInfo> {
        val newAdmin = adminManagementService.createAdmin(request)
        return ApiResponse.success(newAdmin)
    }

    @DeleteMapping("/admins/{adminId}")
    @PreAuthorize("hasAnyRole('MASTER', 'SUPER_ADMIN')")
    fun deleteAdmin(@PathVariable("adminId") adminId: Long): ApiResponse<Unit> {
        adminManagementService.deleteAdmin(adminId)
        return ApiResponse.success(Unit)
    }

    @PutMapping("/admins/{adminId}/password")
    @PreAuthorize("hasAnyRole('MASTER', 'SUPER_ADMIN')")
    fun changeAdminPassword(
        @PathVariable("adminId") adminId: Long,
        @Valid @RequestBody request: ChangePasswordRequest
    ): ApiResponse<AdminBasicInfo> {
        val updatedAdmin = adminManagementService.changeAdminPassword(adminId, request)
        return ApiResponse.success(updatedAdmin)
    }
}
