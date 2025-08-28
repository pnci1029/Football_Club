package io.be.config

import io.be.security.JwtAuthenticationFilter
import io.be.security.JwtTokenProvider
import io.be.service.AdminAuthService
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter

@Configuration
@EnableWebSecurity
class SecurityConfig {

    @Bean
    fun passwordEncoder(): PasswordEncoder {
        return BCryptPasswordEncoder()
    }

    @Bean
    fun jwtAuthenticationFilter(
        jwtTokenProvider: JwtTokenProvider,
        adminAuthService: AdminAuthService
    ): JwtAuthenticationFilter {
        return JwtAuthenticationFilter(jwtTokenProvider, adminAuthService)
    }

    @Bean
    fun filterChain(
        http: HttpSecurity,
        jwtAuthenticationFilter: JwtAuthenticationFilter
    ): SecurityFilterChain {
        http
            .csrf { it.disable() }
            .cors { it.disable() } // CORS는 WebConfig에서 처리
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .authorizeHttpRequests { auth ->
                auth
                    // H2 콘솔 허용 (개발용)
                    .requestMatchers("/h2-console/**").permitAll()
                    .requestMatchers("/api/h2-console/**").permitAll()

                    // Admin 인증 관련 API는 공개 (순서 중요: 더 구체적인 패턴을 먼저)
                    .requestMatchers("/admin/auth/**").permitAll()
                    
                    // 관리자 API는 JWT 인증 필요
                    .requestMatchers("/admin/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                    
                    // 공개 API 허용 (Tenant API는 TenantSecurityInterceptor에서 처리)
                    .requestMatchers("/test/**").permitAll()
                    .requestMatchers("/v1/**").permitAll()
                    .requestMatchers("/api/v1/**").permitAll()
                    .requestMatchers("/api/actuator/**").permitAll()
                    .requestMatchers("/api/swagger-ui/**").permitAll()
                    .requestMatchers("/api/api-docs/**").permitAll()
                    .requestMatchers("/error").permitAll()
                    .requestMatchers("/v1/admin/**").hasAnyRole("ADMIN", "SUPER_ADMIN")

                    // 기타 모든 요청 허용
                    .anyRequest().permitAll()
            }
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter::class.java)
            .headers { headers ->
                headers.frameOptions().sameOrigin() // H2 콘솔을 위한 설정
            }

        return http.build()
    }
}
