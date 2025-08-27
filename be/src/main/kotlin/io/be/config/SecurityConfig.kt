package io.be.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.SecurityFilterChain

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
            .cors { it.disable() }
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .authorizeHttpRequests { auth ->
                auth
                    // H2 콘솔 허용 (개발용)
                    .requestMatchers("/h2-console/**").permitAll()

                    // 공개 API 허용
                    .requestMatchers("/test/**").permitAll()
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

    // CORS 설정은 WebConfig에서 처리하므로 여기서는 제거
}
