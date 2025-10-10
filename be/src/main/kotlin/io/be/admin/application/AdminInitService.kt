package io.be.admin.application

import io.be.admin.domain.Admin
import io.be.admin.domain.AdminLevel
import io.be.admin.domain.AdminRepository
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.CommandLineRunner
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

@Service
class AdminInitService(
    private val adminRepository: AdminRepository,
    private val passwordEncoder: PasswordEncoder,
    @Value("\${owner.id:admin}") private val ownerId: String,
    @Value("\${owner.pw:admin123}") private val ownerPw: String
) : CommandLineRunner {
    
    private val logger = LoggerFactory.getLogger(AdminInitService::class.java)
    
    override fun run(vararg args: String?) {
        initializeMasterAdmin()
        initializeSubdomainAdmins()
    }
    
    /**
     * 마스터 관리자 계정 초기화
     */
    private fun initializeMasterAdmin() {
        try {
            // 기존 마스터 관리자가 있는지 확인
            val existingMaster = adminRepository.findByAdminLevelAndIsActiveOrderByCreatedAtDesc(AdminLevel.MASTER, true)
            if (existingMaster.isNotEmpty()) {
                logger.info("Master admin already exists: ${existingMaster.first().username}")
                return
            }
            
            // 마스터 관리자 계정 생성
            val masterAdmin = Admin(
                username = ownerId,
                password = passwordEncoder.encode(ownerPw),
                role = "SUPER_ADMIN",
                isActive = true,
                email = null,
                name = "System Master",
                teamSubdomain = null, // 마스터는 서브도메인 제한 없음
                adminLevel = AdminLevel.MASTER
            )
            
            adminRepository.save(masterAdmin)
            
            logger.info("✅ Master admin created successfully: $ownerId")
            logger.info("🔒 Please change the default password after first login!")
            
        } catch (e: Exception) {
            logger.error("❌ Failed to create master admin", e)
        }
    }
    
    /**
     * 서브도메인별 기본 관리자 계정 초기화 (예시)
     */
    private fun initializeSubdomainAdmins() {
        try {
            // 예시 서브도메인들 (실제로는 DB에서 조회하거나 설정에서 가져와야 함)
            val exampleSubdomains = listOf("team1", "team2", "team3")
            
            exampleSubdomains.forEach { subdomain ->
                val adminUsername = "${subdomain}_admin"
                
                // 이미 존재하는지 확인
                if (adminRepository.existsByUsername(adminUsername)) {
                    logger.debug("Subdomain admin already exists: $adminUsername")
                    return@forEach
                }
                
                // 서브도메인 관리자 계정 생성
                val subdomainAdmin = Admin(
                    username = adminUsername,
                    password = passwordEncoder.encode("admin123"), // 기본 비밀번호
                    role = "ADMIN",
                    isActive = true,
                    email = null,
                    name = "${subdomain.uppercase()} Admin",
                    teamSubdomain = subdomain,
                    adminLevel = AdminLevel.SUBDOMAIN
                )
                
                adminRepository.save(subdomainAdmin)
                logger.info("✅ Subdomain admin created: $adminUsername for subdomain: $subdomain")
            }
            
        } catch (e: Exception) {
            logger.error("❌ Failed to create subdomain admins", e)
        }
    }
}