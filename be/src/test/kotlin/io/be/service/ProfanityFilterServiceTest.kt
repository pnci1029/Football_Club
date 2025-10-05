package io.be.service

import io.be.shared.service.ProfanityFilterService
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.data.redis.core.RedisTemplate
import org.springframework.data.redis.core.SetOperations
import java.util.concurrent.TimeUnit

class ProfanityFilterServiceTest {

    private lateinit var redisTemplate: RedisTemplate<String, Any>
    private lateinit var setOperations: SetOperations<String, Any>
    private lateinit var profanityFilterService: ProfanityFilterService

    @BeforeEach
    fun setUp() {
        redisTemplate = mockk()
        setOperations = mockk()
        every { redisTemplate.opsForSet() } returns setOperations
        every { redisTemplate.hasKey(any()) } returns false
        every { redisTemplate.expire(any(), any<Long>(), any<TimeUnit>()) } returns true
        
        profanityFilterService = ProfanityFilterService(redisTemplate)
    }

    @Test
    fun `비속어가 포함된 텍스트를 정확히 감지한다`() {
        // Given
        val testWords = setOf("시발", "개새끼", "병신")
        every { setOperations.members("profanity:words") } returns testWords

        // When & Then
        org.junit.jupiter.api.Assertions.assertTrue(profanityFilterService.containsProfanity("이 시발 뭐야"))
        org.junit.jupiter.api.Assertions.assertTrue(profanityFilterService.containsProfanity("개새끼같은"))
        org.junit.jupiter.api.Assertions.assertTrue(profanityFilterService.containsProfanity("병신아"))
        assertFalse(profanityFilterService.containsProfanity("안녕하세요"))
        assertFalse(profanityFilterService.containsProfanity("좋은 하루"))
    }

    @Test
    fun `비속어를 필터링하여 마스킹한다`() {
        // Given
        val testWords = setOf("시발", "개새끼")
        every { setOperations.members("profanity:words") } returns testWords

        // When
        val filtered1 = profanityFilterService.filterProfanity("이 시발 뭐야")
        val filtered2 = profanityFilterService.filterProfanity("개새끼같은 놈")

        // Then
        assertEquals("이 *** 뭐야", filtered1)
        assertEquals("***같은 놈", filtered2)
    }

    @Test
    fun `커스텀 마스킹 문자로 필터링한다`() {
        // Given
        val testWords = setOf("시발")
        every { setOperations.members("profanity:words") } returns testWords

        // When
        val filtered = profanityFilterService.filterProfanity("시발 짜증나", "[금지어]")

        // Then
        assertEquals("[금지어] 짜증나", filtered)
    }

    @Test
    fun `제목과 내용을 모두 검증한다`() {
        // Given
        val testWords = setOf("시발", "개새끼")
        every { setOperations.members("profanity:words") } returns testWords

        // When
        val result1 = profanityFilterService.validateContent("시발 제목", "깨끗한 내용")
        val result2 = profanityFilterService.validateContent("깨끗한 제목", "개새끼 내용")
        val result3 = profanityFilterService.validateContent("깨끗한 제목", "깨끗한 내용")

        // Then
        assertFalse(result1.isValid)
        org.junit.jupiter.api.Assertions.assertTrue(result1.violations.contains("제목에 부적절한 표현이 포함되어 있습니다."))
        
        assertFalse(result2.isValid)
        org.junit.jupiter.api.Assertions.assertTrue(result2.violations.contains("내용에 부적절한 표현이 포함되어 있습니다."))
        
        org.junit.jupiter.api.Assertions.assertTrue(result3.isValid)
        org.junit.jupiter.api.Assertions.assertTrue(result3.violations.isEmpty())
    }

    @Test
    fun `비속어 단어를 추가할 수 있다`() {
        // Given
        every { setOperations.add("profanity:words", "새비속어") } returns 1L

        // When
        val result = profanityFilterService.addProfanityWord("새비속어")

        // Then
        org.junit.jupiter.api.Assertions.assertTrue(result)
        verify { setOperations.add("profanity:words", "새비속어") }
        verify { redisTemplate.expire("profanity:words", 24L, TimeUnit.HOURS) }
    }

    @Test
    fun `비속어 단어를 제거할 수 있다`() {
        // Given
        every { setOperations.remove("profanity:words", "제거할단어") } returns 1L

        // When
        val result = profanityFilterService.removeProfanityWord("제거할단어")

        // Then
        org.junit.jupiter.api.Assertions.assertTrue(result)
        verify { setOperations.remove("profanity:words", "제거할단어") }
    }

    @Test
    fun `비속어 목록 개수를 조회할 수 있다`() {
        // Given
        every { setOperations.size("profanity:words") } returns 50L

        // When
        val count = profanityFilterService.getProfanityWordsCount()

        // Then
        assertEquals(50L, count)
    }

    @Test
    fun `빈 문자열이나 null 값을 안전하게 처리한다`() {
        // When & Then
        assertFalse(profanityFilterService.containsProfanity(""))
        assertFalse(profanityFilterService.containsProfanity("   "))
        assertEquals("", profanityFilterService.filterProfanity(""))
        
        val result = profanityFilterService.validateContent(null, null)
        org.junit.jupiter.api.Assertions.assertTrue(result.isValid)
    }

    @Test
    fun `대소문자를 구분하지 않고 비속어를 감지한다`() {
        // Given
        val testWords = setOf("fuck")
        every { setOperations.members("profanity:words") } returns testWords

        // When & Then
        org.junit.jupiter.api.Assertions.assertTrue(profanityFilterService.containsProfanity("FUCK"))
        org.junit.jupiter.api.Assertions.assertTrue(profanityFilterService.containsProfanity("Fuck"))
        org.junit.jupiter.api.Assertions.assertTrue(profanityFilterService.containsProfanity("fuck"))
    }

    @Test
    fun `특수문자가 포함된 텍스트도 올바르게 처리한다`() {
        // Given
        val testWords = setOf("시발")
        every { setOperations.members("profanity:words") } returns testWords

        // When & Then
        org.junit.jupiter.api.Assertions.assertTrue(profanityFilterService.containsProfanity("시!@#발"))
        org.junit.jupiter.api.Assertions.assertTrue(profanityFilterService.containsProfanity("시 발"))
        org.junit.jupiter.api.Assertions.assertTrue(profanityFilterService.containsProfanity("시-발"))
    }

    @Test
    fun `Redis 연결 실패 시 기본 비속어 목록을 사용한다`() {
        // Given
        every { setOperations.members("profanity:words") } throws RuntimeException("Redis connection failed")

        // When & Then
        org.junit.jupiter.api.Assertions.assertTrue(profanityFilterService.containsProfanity("시발"))
        org.junit.jupiter.api.Assertions.assertTrue(profanityFilterService.containsProfanity("개새끼"))
        assertFalse(profanityFilterService.containsProfanity("안녕하세요"))
    }
}