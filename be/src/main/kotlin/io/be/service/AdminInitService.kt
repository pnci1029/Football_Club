package io.be.service

import io.be.entity.Admin
import io.be.repository.AdminRepository
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
        initializeOwnerAdmin()
    }
    
    private fun initializeOwnerAdmin() {
        try {
            // 기존 owner 계정이 있는지 확인
            if (adminRepository.existsByUsername(ownerId)) {
                logger.info("Owner admin already exists: $ownerId")
                return
            }
            
            // Owner 관리자 계정 생성
            val ownerAdmin = Admin(
                username = ownerId,
                password = passwordEncoder.encode(ownerPw),
                role = "SUPER_ADMIN",
                isActive = true,
                email = null,
                name = "System Owner"
            )
            
            adminRepository.save(ownerAdmin)
            
            logger.info("✅ Owner admin created successfully: $ownerId")
            logger.info("🔒 Please change the default password after first login!")
            
        } catch (e: Exception) {
            logger.error("❌ Failed to create owner admin", e)
        }
    }
}