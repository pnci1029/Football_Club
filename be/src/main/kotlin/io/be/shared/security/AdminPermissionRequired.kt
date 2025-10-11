package io.be.shared.security

import io.be.admin.domain.AdminLevel

/**
 * 관리자 권한 필요 어노테이션
 * API 메서드에 붙여서 권한 검증을 수행
 */
@Target(AnnotationTarget.FUNCTION, AnnotationTarget.CLASS)
@Retention(AnnotationRetention.RUNTIME)
annotation class AdminPermissionRequired(
    /**
     * 필요한 관리자 레벨 (최소 요구 레벨)
     */
    val level: AdminLevel = AdminLevel.SUBDOMAIN,
    
    /**
     * 서브도메인 제한 여부
     * true: 서브도메인 관리자는 해당 서브도메인 데이터만 접근 가능
     * false: 권한만 확인하고 서브도메인 제한 없음
     */
    val enforceSubdomainRestriction: Boolean = true
)