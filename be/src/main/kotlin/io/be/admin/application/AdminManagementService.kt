package io.be.admin.application

import io.be.admin.domain.Admin
import io.be.admin.domain.AdminLevel
import io.be.admin.domain.AdminRepository
import io.be.admin.dto.AdminBasicInfo
import io.be.admin.dto.ChangePasswordRequest
import io.be.admin.dto.CreateAdminRequest
import io.be.team.domain.TeamRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class AdminManagementService(
    private val adminRepository: AdminRepository,
    private val teamRepository: TeamRepository,
    private val passwordEncoder: PasswordEncoder
) {

    @Transactional(readOnly = true)
    fun getAdminsByTeam(teamId: Long): List<AdminBasicInfo> {
        val team = teamRepository.findById(teamId).orElseThrow { NoSuchElementException("Team not found with id: $teamId") }
        val admins = adminRepository.findByTeamSubdomainAndIsActiveOrderByCreatedAtDesc(team.code, true)
        return admins.map { AdminBasicInfo.from(it) }
    }

    @Transactional(readOnly = true)
    fun getAdminsByTeam(teamId: Long, page: Int, size: Int): Page<AdminBasicInfo> {
        val team = teamRepository.findById(teamId).orElseThrow { NoSuchElementException("Team not found with id: $teamId") }
        val pageRequest = PageRequest.of(page, size)
        val adminPage = adminRepository.findByTeamSubdomainAndIsActiveOrderByCreatedAtDesc(team.code, true, pageRequest)
        return adminPage.map { AdminBasicInfo.from(it) }
    }

    @Transactional(readOnly = true)
    fun getAllAdmins(page: Int, size: Int): Page<AdminBasicInfo> {
        val pageRequest = PageRequest.of(page, size)
        val adminPage = adminRepository.findByIsActiveOrderByCreatedAtDesc(true, pageRequest)
        return adminPage.map { AdminBasicInfo.from(it) }
    }

    @Transactional
    fun createAdmin(request: CreateAdminRequest): AdminBasicInfo {
        val team = teamRepository.findById(request.teamId).orElseThrow { NoSuchElementException("Team not found with id: ${request.teamId}") }

        if (adminRepository.existsByUsername(request.username)) {
            throw IllegalArgumentException("Username already exists: ${request.username}")
        }

        val newAdmin = Admin(
            username = request.username,
            password = passwordEncoder.encode(request.password), // Use password from request
            role = "ADMIN",
            isActive = true,
            email = request.email,
            name = request.name,
            teamSubdomain = team.code,
            adminLevel = AdminLevel.SUBDOMAIN
        )

        val savedAdmin = adminRepository.save(newAdmin)
        return AdminBasicInfo.from(savedAdmin)
    }

    @Transactional
    fun deleteAdmin(adminId: Long) {
        val admin = adminRepository.findById(adminId).orElseThrow { NoSuchElementException("Admin not found with id: $adminId") }
        // Instead of deleting, set isActive to false
        val updatedAdmin = admin.copy(isActive = false)
        adminRepository.save(updatedAdmin)
    }

    @Transactional
    fun changeAdminPassword(adminId: Long, request: ChangePasswordRequest): AdminBasicInfo {
        val admin = adminRepository.findById(adminId).orElseThrow { NoSuchElementException("Admin not found with id: $adminId") }
        
        val updatedAdmin = admin.copy(
            password = passwordEncoder.encode(request.newPassword)
        )
        val savedAdmin = adminRepository.save(updatedAdmin)
        return AdminBasicInfo.from(savedAdmin)
    }
}
