package io.be.filter

import io.be.config.SubdomainResolver
import io.be.service.SubdomainService
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
@Order(1)
class SubdomainFilter(
    private val subdomainResolver: SubdomainResolver,
    private val subdomainService: SubdomainService
) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val host = request.getHeader("X-Forwarded-Host")
            ?: request.getHeader("Host")
            ?: request.serverName

        val teamCode = subdomainResolver.extractTeamFromHost(host)
        val team = teamCode?.let { subdomainService.getTeamByCode(it) }

        request.setAttribute("teamCode", teamCode)
        request.setAttribute("team", team)
        request.setAttribute("host", host)

        filterChain.doFilter(request, response)
    }

    override fun shouldNotFilter(request: HttpServletRequest): Boolean {
        val path = request.servletPath
        val host = request.getHeader("X-Forwarded-Host")
            ?: request.getHeader("Host")
            ?: request.serverName

        // 관리자 API, 공통 API, admin 서브도메인은 필터 적용 안 함
        return path.startsWith("/v1/admin/") ||
               path.startsWith("/h2-console") ||
               path == "/v1/teams" ||
               subdomainResolver.isAdminSubdomain(host)
    }
}
