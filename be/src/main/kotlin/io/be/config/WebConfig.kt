package io.be.config

import io.be.service.SubdomainService
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.HandlerInterceptor
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.InterceptorRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
class WebConfig(
    private val subdomainService: SubdomainService
) : WebMvcConfigurer {

    override fun addCorsMappings(registry: CorsRegistry) {
        registry.addMapping("/**")
            .allowedOriginPatterns("*")
            .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(false)
            .maxAge(3600)
    }

    override fun addInterceptors(registry: InterceptorRegistry) {
        registry.addInterceptor(SubdomainInterceptor(subdomainService))
            .addPathPatterns("/v1/team/**")
    }

    class SubdomainInterceptor(
        private val subdomainService: SubdomainService
    ) : HandlerInterceptor {

        override fun preHandle(
            request: HttpServletRequest,
            response: HttpServletResponse,
            handler: Any
        ): Boolean {
            val teamCode = subdomainService.extractTeamCodeFromRequest(request)

            // 개발 환경에서는 팀 코드가 없어도 허용
            val host = request.getHeader("X-Forwarded-Host")
                ?: request.getHeader("Host")
                ?: request.serverName
            val isLocalhost = host.contains("localhost") || host.contains("127.0.0.1")

            if (teamCode == null && !isLocalhost) {
                response.status = HttpServletResponse.SC_BAD_REQUEST
                response.contentType = "application/json"
                response.writer.write("""
                    {
                        "success": false,
                        "errorCode": "INVALID_SUBDOMAIN",
                        "message": "유효하지 않은 서브도메인입니다."
                    }
                """.trimIndent())
                return false
            }

            // 요청에 팀 코드 추가 (컨트롤러에서 사용 가능)
            request.setAttribute("teamCode", teamCode)

            return true
        }
    }
}
