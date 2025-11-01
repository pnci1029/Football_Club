package io.be.admin.presentation

import io.be.admin.application.AdminManagementService
import io.be.admin.dto.AdminBasicInfo
import io.be.admin.dto.CreateAdminRequest
import io.be.shared.util.ApiResponse
import org.springframework.http.ResponseEntity
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
    fun getAdminsByTeam(@RequestParam("teamId") teamId: Long): ResponseEntity<ApiResponse<List<AdminBasicInfo>>> {
        val admins = adminManagementService.getAdminsByTeam(teamId)
        return ResponseEntity.ok(ApiResponse.success(admins))
    }

    @PostMapping("/admins")
    @PreAuthorize("hasAnyRole('MASTER', 'SUPER_ADMIN')")
    fun createAdmin(@RequestBody request: CreateAdminRequest): ResponseEntity<ApiResponse<AdminBasicInfo>> {
        val newAdmin = adminManagementService.createAdmin(request)
        return ResponseEntity.ok(ApiResponse.success(newAdmin))
    }

    @DeleteMapping("/admins/{adminId}")
    @PreAuthorize("hasAnyRole('MASTER', 'SUPER_ADMIN')")
    fun deleteAdmin(@PathVariable("adminId") adminId: Long): ResponseEntity<ApiResponse<Unit>> {
        adminManagementService.deleteAdmin(adminId)
        return ResponseEntity.ok(ApiResponse.success(Unit))
    }
}
