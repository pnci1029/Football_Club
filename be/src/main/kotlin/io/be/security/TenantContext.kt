package io.be.security

import java.time.LocalDateTime

/**
 * 테넌트 컨텍스트 정보를 담는 데이터 클래스
 */
data class TenantContext(
    val teamId: Long,
    val subdomain: String,
    val teamName: String,
    val host: String,
    val userId: String? = null,
    val userRole: String? = null,
    val createdAt: LocalDateTime = LocalDateTime.now()
) {
    fun isValid(): Boolean {
        return teamId > 0 && 
               subdomain.isNotBlank() && 
               teamName.isNotBlank() &&
               host.isNotBlank()
    }
}

/**
 * Thread-Local을 사용한 테넌트 컨텍스트 홀더
 */
object TenantContextHolder {
    private val contextHolder = ThreadLocal<TenantContext>()
    
    /**
     * 현재 스레드에 테넌트 컨텍스트 설정
     */
    fun setContext(context: TenantContext) {
        if (!context.isValid()) {
            throw IllegalArgumentException("Invalid tenant context: $context")
        }
        contextHolder.set(context)
    }
    
    /**
     * 현재 스레드의 테넌트 컨텍스트 조회
     * @throws SecurityException 컨텍스트가 설정되지 않은 경우
     */
    fun getContext(): TenantContext {
        return contextHolder.get() 
            ?: throw SecurityException("No tenant context found. This operation requires a valid tenant context.")
    }
    
    /**
     * 현재 스레드의 테넌트 컨텍스트 조회 (Nullable)
     */
    fun getContextOrNull(): TenantContext? {
        return contextHolder.get()
    }
    
    /**
     * 현재 팀 ID 조회
     */
    fun getTeamId(): Long {
        return getContext().teamId
    }
    
    /**
     * 현재 서브도메인 조회
     */
    fun getSubdomain(): String {
        return getContext().subdomain
    }
    
    /**
     * 현재 팀 이름 조회
     */
    fun getTeamName(): String {
        return getContext().teamName
    }
    
    /**
     * 테넌트 컨텍스트가 설정되어 있는지 확인
     */
    fun hasContext(): Boolean {
        return contextHolder.get() != null
    }
    
    /**
     * 특정 팀에 대한 접근 권한이 있는지 확인
     */
    fun hasAccessToTeam(teamId: Long): Boolean {
        val context = getContextOrNull() ?: return false
        return context.teamId == teamId
    }
    
    /**
     * 현재 스레드의 테넌트 컨텍스트 정리
     */
    fun clear() {
        contextHolder.remove()
    }
    
    /**
     * 디버그 정보 조회
     */
    fun getDebugInfo(): String {
        val context = getContextOrNull()
        return if (context != null) {
            "TenantContext(teamId=${context.teamId}, subdomain=${context.subdomain}, host=${context.host})"
        } else {
            "TenantContext(NOT_SET)"
        }
    }
}