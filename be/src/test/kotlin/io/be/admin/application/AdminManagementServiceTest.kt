package io.be.admin.application

import io.be.admin.domain.Admin
import io.be.admin.domain.AdminLevel
import io.be.admin.domain.AdminRepository
import io.be.admin.dto.CreateAdminRequest
import io.be.admin.dto.UpdateAdminRequest
import io.be.shared.exception.ResourceNotFoundException
import io.be.shared.exception.DuplicateResourceException
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.*
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import org.springframework.security.crypto.password.PasswordEncoder
import java.util.*
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

class AdminManagementServiceTest {

    private val adminRepository = mock<AdminRepository>()
    private val passwordEncoder = mock<PasswordEncoder>()

    private val adminManagementService = AdminManagementService(adminRepository, passwordEncoder)

    @Test
    fun `서브도메인 관리자 생성 성공`() {
        val request = CreateAdminRequest(
            username = "team1admin",
            password = "password123",
            email = "team1@test.com",
            name = "Team1 Admin",
            teamSubdomain = "team1"
        )

        whenever(adminRepository.existsByUsername("team1admin")).thenReturn(false)
        whenever(passwordEncoder.encode("password123")).thenReturn("encodedPassword")
        whenever(adminRepository.save(any<Admin>())).thenAnswer { it.arguments[0] as Admin }

        val result = adminManagementService.createSubdomainAdmin(request)

        assertNotNull(result)
        assertEquals("team1admin", result.username)
        assertEquals("team1", result.teamSubdomain)
        assertEquals("SUBDOMAIN", result.adminLevel)
        
        verify(adminRepository).save(argThat<Admin> { 
            username == "team1admin" && 
            teamSubdomain == "team1" && 
            adminLevel == AdminLevel.SUBDOMAIN 
        })
    }

    @Test
    fun `중복 사용자명으로 관리자 생성 실패`() {
        val request = CreateAdminRequest(
            username = "existingadmin",
            password = "password123",
            email = "admin@test.com",
            name = "Admin",
            teamSubdomain = "team1"
        )

        whenever(adminRepository.existsByUsername("existingadmin")).thenReturn(true)

        assertThrows<DuplicateResourceException> {
            adminManagementService.createSubdomainAdmin(request)
        }

        verify(adminRepository, never()).save(any<Admin>())
    }

    @Test
    fun `관리자 목록 조회 성공`() {
        val admin1 = Admin(
            id = 1L,
            username = "admin1",
            password = "password",
            adminLevel = AdminLevel.SUBDOMAIN,
            teamSubdomain = "team1"
        )
        val admin2 = Admin(
            id = 2L,
            username = "admin2", 
            password = "password",
            adminLevel = AdminLevel.SUBDOMAIN,
            teamSubdomain = "team2"
        )
        val page = PageImpl(listOf(admin1, admin2), PageRequest.of(0, 10), 2)

        whenever(adminRepository.findByAdminLevel(AdminLevel.SUBDOMAIN, PageRequest.of(0, 10)))
            .thenReturn(page)

        val result = adminManagementService.getSubdomainAdmins(PageRequest.of(0, 10))

        assertEquals(2, result.content.size)
        assertEquals("admin1", result.content[0].username)
        assertEquals("admin2", result.content[1].username)
    }

    @Test
    fun `특정 관리자 조회 성공`() {
        val admin = Admin(
            id = 1L,
            username = "admin1",
            password = "password",
            adminLevel = AdminLevel.SUBDOMAIN,
            teamSubdomain = "team1"
        )

        whenever(adminRepository.findById(1L)).thenReturn(Optional.of(admin))

        val result = adminManagementService.getAdminById(1L)

        assertEquals("admin1", result.username)
        assertEquals("team1", result.teamSubdomain)
    }

    @Test
    fun `존재하지 않는 관리자 조회 실패`() {
        whenever(adminRepository.findById(999L)).thenReturn(Optional.empty())

        assertThrows<ResourceNotFoundException> {
            adminManagementService.getAdminById(999L)
        }
    }

    @Test
    fun `관리자 정보 수정 성공`() {
        val existingAdmin = Admin(
            id = 1L,
            username = "admin1",
            password = "oldPassword",
            email = "old@test.com",
            name = "Old Name",
            adminLevel = AdminLevel.SUBDOMAIN,
            teamSubdomain = "team1"
        )

        val updateRequest = UpdateAdminRequest(
            email = "new@test.com",
            name = "New Name",
            isActive = true
        )

        whenever(adminRepository.findById(1L)).thenReturn(Optional.of(existingAdmin))
        whenever(adminRepository.save(any<Admin>())).thenAnswer { it.arguments[0] as Admin }

        val result = adminManagementService.updateAdmin(1L, updateRequest)

        assertEquals("new@test.com", result.email)
        assertEquals("New Name", result.name)
        verify(adminRepository).save(any<Admin>())
    }

    @Test
    fun `관리자 삭제 성공`() {
        val admin = Admin(
            id = 1L,
            username = "admin1",
            password = "password",
            adminLevel = AdminLevel.SUBDOMAIN,
            teamSubdomain = "team1"
        )

        whenever(adminRepository.findById(1L)).thenReturn(Optional.of(admin))
        doNothing().whenever(adminRepository).delete(admin)

        adminManagementService.deleteAdmin(1L)

        verify(adminRepository).delete(admin)
    }

    @Test
    fun `마스터 관리자 삭제 시도시 실패`() {
        val masterAdmin = Admin(
            id = 1L,
            username = "master",
            password = "password",
            adminLevel = AdminLevel.MASTER
        )

        whenever(adminRepository.findById(1L)).thenReturn(Optional.of(masterAdmin))

        assertThrows<IllegalArgumentException> {
            adminManagementService.deleteAdmin(1L)
        }

        verify(adminRepository, never()).delete(any<Admin>())
    }

    @Test
    fun `비밀번호 변경 성공`() {
        val admin = Admin(
            id = 1L,
            username = "admin1",
            password = "oldEncodedPassword",
            adminLevel = AdminLevel.SUBDOMAIN,
            teamSubdomain = "team1"
        )

        whenever(adminRepository.findById(1L)).thenReturn(Optional.of(admin))
        whenever(passwordEncoder.encode("newPassword123")).thenReturn("newEncodedPassword")
        whenever(adminRepository.save(any<Admin>())).thenAnswer { it.arguments[0] as Admin }

        adminManagementService.changePassword(1L, "newPassword123")

        verify(adminRepository).save(argThat<Admin> { 
            password == "newEncodedPassword" 
        })
    }

    @Test
    fun `서브도메인별 관리자 조회 성공`() {
        val admin = Admin(
            id = 1L,
            username = "team1admin",
            password = "password",
            adminLevel = AdminLevel.SUBDOMAIN,
            teamSubdomain = "team1"
        )

        whenever(adminRepository.findByTeamSubdomainAndIsActive("team1", true))
            .thenReturn(listOf(admin))

        val result = adminManagementService.getAdminsByTeamSubdomain("team1")

        assertEquals(1, result.size)
        assertEquals("team1admin", result[0].username)
        assertEquals("team1", result[0].teamSubdomain)
    }
}