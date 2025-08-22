package io.be.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@Configuration
@EnableWebSecurity
class SecurityConfig {

    @Bean
    fun passwordEncoder(): PasswordEncoder {
        return BCryptPasswordEncoder()
    }

    @Bean
    fun filterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .csrf { it.disable() }
            .cors { it.configurationSource(corsConfigurationSource()) }
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .authorizeHttpRequests { auth ->
                auth
                    // H2 콘솔 허용 (개발용)
                    .requestMatchers("/h2-console/**").permitAll()
                    
                    // 공개 API 허용
                    .requestMatchers("/v1/players/**").permitAll()
                    .requestMatchers("/v1/stadiums/**").permitAll()
                    .requestMatchers("/v1/matches/**").permitAll()
                    .requestMatchers("/v1/team/**").permitAll()
                    
                    // 관리자 API는 인증 필요 (임시로 허용, 추후 JWT 구현 시 변경)
                    .requestMatchers("/v1/admin/**").permitAll() // TODO: 추후 .authenticated()로 변경
                    
                    // 기타 모든 요청 허용
                    .anyRequest().permitAll()
            }
            .headers { headers ->
                headers.frameOptions().sameOrigin() // H2 콘솔을 위한 설정
            }

        return http.build()
    }

    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val configuration = CorsConfiguration()
        
        // 모든 도메인 허용 (개발용, 프로덕션에서는 특정 도메인만 허용)
        configuration.allowedOriginPatterns = listOf("*")
        
        // 허용할 HTTP 메서드
        configuration.allowedMethods = listOf("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
        
        // 허용할 헤더
        configuration.allowedHeaders = listOf("*")
        
        // 자격 증명 허용
        configuration.allowCredentials = true
        
        // 서브도메인 처리를 위한 특별 설정
        configuration.addAllowedOriginPattern("*.footballclub.com")
        configuration.addAllowedOriginPattern("http://localhost:*")
        configuration.addAllowedOriginPattern("https://localhost:*")
        
        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", configuration)
        
        return source
    }
}