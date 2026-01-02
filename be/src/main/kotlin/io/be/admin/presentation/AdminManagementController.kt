package io.be.admin.presentation

import io.be.admin.application.AdminManagementService
import io.be.admin.dto.AdminBasicInfo
import io.be.admin.dto.CreateAdminRequest
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
    fun getAdminsByTeam(@RequestParam("teamId") teamId: Long): ResponseEntity<List<AdminBasicInfo>> {
        val admins = adminManagementService.getAdminsByTeam(teamId)
        return ResponseEntity.ok(admins)
    }

    @PostMapping("/admins")
    @PreAuthorize("hasAnyRole('MASTER', 'SUPER_ADMIN')")
    fun createAdmin(@RequestBody request: CreateAdminRequest): ResponseEntity<AdminBasicInfo> {
        val newAdmin = adminManagementService.createAdmin(request)
        return ResponseEntity.ok(newAdmin)
    }

    @DeleteMapping("/admins/{adminId}")
    @PreAuthorize("hasAnyRole('MASTER', 'SUPER_ADMIN')")
    fun deleteAdmin(@PathVariable("adminId") adminId: Long): ResponseEntity<Unit> {
        adminManagementService.deleteAdmin(adminId)
        return ResponseEntity.ok(Unit)
    }
}
