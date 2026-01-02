package io.be.admin.presentation

import io.be.admin.application.AdminManagementService
import io.be.admin.dto.AdminBasicInfo
import io.be.admin.dto.CreateAdminRequest
import io.be.shared.util.ApiResponse
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
    fun getAdminsByTeam(@RequestParam("teamId") teamId: Long): ApiResponse<List<AdminBasicInfo>> {
        val admins = adminManagementService.getAdminsByTeam(teamId)
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
}
