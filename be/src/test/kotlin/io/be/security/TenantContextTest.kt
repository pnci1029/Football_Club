package io.be.security

import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.time.LocalDateTime
import kotlin.test.*

class TenantContextTest {

    @BeforeEach
    @AfterEach
    fun clearContext() {
        TenantContextHolder.clear()
    }

    @Test
    fun `should create valid tenant context`() {
        // given
        val context = TenantContext(
            teamId = 1L,
            subdomain = "barcelona",
            teamName = "FC Barcelona",
            host = "barcelona.football-club.kr"
        )

        // when & then
        assertTrue(context.isValid())
        assertEquals(1L, context.teamId)
        assertEquals("barcelona", context.subdomain)
        assertEquals("FC Barcelona", context.teamName)
        assertEquals("barcelona.football-club.kr", context.host)
    }

    @Test
    fun `should reject invalid tenant context with invalid team id`() {
        // given
        val context = TenantContext(
            teamId = 0L, // Invalid
            subdomain = "barcelona",
            teamName = "FC Barcelona",
            host = "barcelona.football-club.kr"
        )

        // when & then
        assertFalse(context.isValid())
    }

    @Test
    fun `should reject invalid tenant context with blank subdomain`() {
        // given
        val context = TenantContext(
            teamId = 1L,
            subdomain = "", // Invalid
            teamName = "FC Barcelona",
            host = "barcelona.football-club.kr"
        )

        // when & then
        assertFalse(context.isValid())
    }

    @Test
    fun `should set and get tenant context`() {
        // given
        val context = TenantContext(
            teamId = 1L,
            subdomain = "barcelona",
            teamName = "FC Barcelona",
            host = "barcelona.football-club.kr"
        )

        // when
        TenantContextHolder.setContext(context)

        // then
        assertTrue(TenantContextHolder.hasContext())
        assertEquals(context, TenantContextHolder.getContext())
        assertEquals(1L, TenantContextHolder.getTeamId())
        assertEquals("barcelona", TenantContextHolder.getSubdomain())
        assertEquals("FC Barcelona", TenantContextHolder.getTeamName())
    }

    @Test
    fun `should throw exception when setting invalid context`() {
        // given
        val invalidContext = TenantContext(
            teamId = 0L, // Invalid
            subdomain = "barcelona",
            teamName = "FC Barcelona",
            host = "barcelona.football-club.kr"
        )

        // when & then
        assertThrows<IllegalArgumentException> {
            TenantContextHolder.setContext(invalidContext)
        }
    }

    @Test
    fun `should throw exception when getting context without setting it`() {
        // given
        // No context set

        // when & then
        assertThrows<SecurityException> {
            TenantContextHolder.getContext()
        }

        assertThrows<SecurityException> {
            TenantContextHolder.getTeamId()
        }

        assertThrows<SecurityException> {
            TenantContextHolder.getSubdomain()
        }
    }

    @Test
    fun `should return null when getting context without setting it (nullable version)`() {
        // given
        // No context set

        // when
        val context = TenantContextHolder.getContextOrNull()

        // then
        assertNull(context)
        assertFalse(TenantContextHolder.hasContext())
    }

    @Test
    fun `should check team access correctly`() {
        // given
        val context = TenantContext(
            teamId = 1L,
            subdomain = "barcelona",
            teamName = "FC Barcelona",
            host = "barcelona.football-club.kr"
        )
        TenantContextHolder.setContext(context)

        // when & then
        assertTrue(TenantContextHolder.hasAccessToTeam(1L))
        assertFalse(TenantContextHolder.hasAccessToTeam(2L))
    }

    @Test
    fun `should check team access without context`() {
        // given
        // No context set

        // when & then
        assertFalse(TenantContextHolder.hasAccessToTeam(1L))
    }

    @Test
    fun `should clear context correctly`() {
        // given
        val context = TenantContext(
            teamId = 1L,
            subdomain = "barcelona",
            teamName = "FC Barcelona",
            host = "barcelona.football-club.kr"
        )
        TenantContextHolder.setContext(context)
        assertTrue(TenantContextHolder.hasContext())

        // when
        TenantContextHolder.clear()

        // then
        assertFalse(TenantContextHolder.hasContext())
        assertNull(TenantContextHolder.getContextOrNull())
    }

    @Test
    fun `should provide debug information`() {
        // given
        val context = TenantContext(
            teamId = 1L,
            subdomain = "barcelona",
            teamName = "FC Barcelona",
            host = "barcelona.football-club.kr"
        )

        // when
        val debugInfoWithoutContext = TenantContextHolder.getDebugInfo()
        TenantContextHolder.setContext(context)
        val debugInfoWithContext = TenantContextHolder.getDebugInfo()

        // then
        assertEquals("TenantContext(NOT_SET)", debugInfoWithoutContext)
        assertEquals("TenantContext(teamId=1, subdomain=barcelona, host=barcelona.football-club.kr)", debugInfoWithContext)
    }

    @Test
    fun `should handle concurrent access safely`() {
        // This test demonstrates thread-local behavior
        val contexts = mutableListOf<TenantContext>()
        val threads = mutableListOf<Thread>()

        // given - create multiple threads with different contexts
        repeat(5) { i ->
            val thread = Thread {
                val context = TenantContext(
                    teamId = (i + 1).toLong(),
                    subdomain = "team$i",
                    teamName = "Team $i",
                    host = "team$i.football-club.kr"
                )
                
                TenantContextHolder.setContext(context)
                
                // Simulate some work
                Thread.sleep(10)
                
                // Each thread should have its own context
                val retrievedContext = TenantContextHolder.getContext()
                synchronized(contexts) {
                    contexts.add(retrievedContext)
                }
                
                TenantContextHolder.clear()
            }
            
            threads.add(thread)
            thread.start()
        }

        // when - wait for all threads to complete
        threads.forEach { it.join() }

        // then - each thread should have had its own context
        assertEquals(5, contexts.size)
        assertEquals(setOf(1L, 2L, 3L, 4L, 5L), contexts.map { it.teamId }.toSet())
        assertEquals(setOf("team0", "team1", "team2", "team3", "team4"), contexts.map { it.subdomain }.toSet())
    }

    @Test
    fun `should include optional fields in context`() {
        // given
        val context = TenantContext(
            teamId = 1L,
            subdomain = "barcelona",
            teamName = "FC Barcelona",
            host = "barcelona.football-club.kr",
            userId = "admin123",
            userRole = "ADMIN"
        )

        // when
        TenantContextHolder.setContext(context)
        val retrievedContext = TenantContextHolder.getContext()

        // then
        assertEquals("admin123", retrievedContext.userId)
        assertEquals("ADMIN", retrievedContext.userRole)
        assertTrue(retrievedContext.createdAt.isBefore(LocalDateTime.now().plusSeconds(1)))
    }
}