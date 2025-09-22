package io.be.security

import io.jsonwebtoken.*
import io.jsonwebtoken.security.Keys
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.nio.charset.StandardCharsets
import java.security.Key
import java.util.*

@Component
class JwtTokenProvider {
    
    private val logger = LoggerFactory.getLogger(JwtTokenProvider::class.java)
    
    @Value("\${jwt.secret:football-club-secret-key-that-should-be-at-least-32-characters-long}")
    private lateinit var secretKey: String
    
    @Value("\${jwt.expiration:604800}") // 7 days in seconds
    private var jwtExpiration: Long = 604800
    
    @Value("\${jwt.refresh-expiration:2592000}") // 30 days in seconds  
    private var refreshExpiration: Long = 2592000
    
    private fun getSigningKey(): Key {
        val keyBytes = secretKey.toByteArray(StandardCharsets.UTF_8)
        return Keys.hmacShaKeyFor(keyBytes)
    }
    
    /**
     * Access Token 생성
     */
    fun createAccessToken(adminId: Long, username: String, role: String): String {
        val now = Date()
        val expiryDate = Date(now.time + jwtExpiration * 1000)
        
        return Jwts.builder()
            .setSubject(adminId.toString())
            .claim("username", username)
            .claim("role", role)
            .claim("type", "access")
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .signWith(getSigningKey(), SignatureAlgorithm.HS256)
            .compact()
    }
    
    /**
     * Refresh Token 생성
     */
    fun createRefreshToken(adminId: Long): String {
        val now = Date()
        val expiryDate = Date(now.time + refreshExpiration * 1000)
        
        return Jwts.builder()
            .setSubject(adminId.toString())
            .claim("type", "refresh")
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .signWith(getSigningKey(), SignatureAlgorithm.HS256)
            .compact()
    }
    
    /**
     * 토큰에서 Admin ID 추출
     */
    fun getAdminIdFromToken(token: String): Long {
        val claims = Jwts.parserBuilder()
            .setSigningKey(getSigningKey())
            .build()
            .parseClaimsJws(token)
            .body
        
        return claims.subject.toLong()
    }
    
    /**
     * 토큰에서 사용자명 추출
     */
    fun getUsernameFromToken(token: String): String? {
        return try {
            val claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .body
            
            claims["username"] as? String
        } catch (e: Exception) {
            logger.warn("Cannot extract username from token", e)
            null
        }
    }
    
    /**
     * 토큰에서 역할 추출
     */
    fun getRoleFromToken(token: String): String? {
        return try {
            val claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .body
            
            claims["role"] as? String
        } catch (e: Exception) {
            logger.warn("Cannot extract role from token", e)
            null
        }
    }
    
    /**
     * 토큰 타입 확인 (access/refresh)
     */
    fun getTokenType(token: String): String? {
        return try {
            val claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .body
            
            claims["type"] as? String
        } catch (e: Exception) {
            logger.warn("Cannot extract token type", e)
            null
        }
    }
    
    /**
     * 토큰 유효성 검사
     */
    fun validateToken(token: String): Boolean {
        return try {
            Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
            true
        } catch (e: MalformedJwtException) {
            logger.error("Invalid JWT token: {}", e.message)
            false
        } catch (e: ExpiredJwtException) {
            logger.error("JWT token is expired: {}", e.message)
            false
        } catch (e: UnsupportedJwtException) {
            logger.error("JWT token is unsupported: {}", e.message)
            false
        } catch (e: IllegalArgumentException) {
            logger.error("JWT claims string is empty: {}", e.message)
            false
        } catch (e: Exception) {
            logger.error("JWT validation error: {}", e.message)
            false
        }
    }
    
    /**
     * Access Token인지 확인
     */
    fun isAccessToken(token: String): Boolean {
        return getTokenType(token) == "access"
    }
    
    /**
     * Refresh Token인지 확인
     */
    fun isRefreshToken(token: String): Boolean {
        return getTokenType(token) == "refresh"
    }
    
    /**
     * 토큰 만료 시간 조회
     */
    fun getExpirationFromToken(token: String): Date? {
        return try {
            val claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .body
            
            claims.expiration
        } catch (e: Exception) {
            logger.warn("Cannot extract expiration from token", e)
            null
        }
    }
}