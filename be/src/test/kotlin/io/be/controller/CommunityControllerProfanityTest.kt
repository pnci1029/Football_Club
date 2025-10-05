package io.be.controller

import com.fasterxml.jackson.databind.ObjectMapper
import io.be.community.dto.CreatePostRequest
import io.be.community.dto.CreateCommentRequest
import io.be.shared.service.ProfanityFilterService
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import org.springframework.web.context.WebApplicationContext

@SpringBootTest
@ActiveProfiles("test")
class CommunityControllerProfanityTest {

    @Autowired
    private lateinit var webApplicationContext: WebApplicationContext

    @MockBean
    private lateinit var profanityFilterService: ProfanityFilterService

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    private val mockMvc: MockMvc by lazy {
        MockMvcBuilders.webAppContextSetup(webApplicationContext).build()
    }

    @Test
    fun `비속어가 포함된 게시글 작성 시 에러를 반환한다`() {
        // Given
        val profanityValidation = ProfanityFilterService.ValidationResult(
            isValid = false,
            violations = listOf("제목에 부적절한 표현이 포함되어 있습니다.")
        )
        whenever(profanityFilterService.validateContent(any(), any())).thenReturn(profanityValidation)

        val request = CreatePostRequest(
            title = "시발 제목",
            content = "깨끗한 내용",
            authorName = "테스트",
            authorEmail = "test@test.com",
            authorPhone = null,
            authorPassword = "password123",
            teamId = 1L
        )

        // When & Then
        mockMvc.perform(
            post("/v1/community/posts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.error.message").value("제목에 부적절한 표현이 포함되어 있습니다."))
    }

    @Test
    fun `깨끗한 내용의 게시글은 정상적으로 작성된다`() {
        // Given
        val cleanValidation = ProfanityFilterService.ValidationResult(
            isValid = true,
            violations = emptyList()
        )
        whenever(profanityFilterService.validateContent(any(), any())).thenReturn(cleanValidation)

        val request = CreatePostRequest(
            title = "깨끗한 제목",
            content = "깨끗한 내용",
            authorName = "테스트",
            authorEmail = "test@test.com",
            authorPhone = null,
            authorPassword = "password123",
            teamId = 1L
        )

        // When & Then
        mockMvc.perform(
            post("/v1/community/posts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
    }

    @Test
    fun `비속어가 포함된 댓글 작성 시 에러를 반환한다`() {
        // Given
        val profanityValidation = ProfanityFilterService.ValidationResult(
            isValid = false,
            violations = listOf("내용에 부적절한 표현이 포함되어 있습니다.")
        )
        whenever(profanityFilterService.validateContent(any(), any())).thenReturn(profanityValidation)

        val request = CreateCommentRequest(
            content = "개새끼 댓글",
            authorName = "테스트",
            authorEmail = "test@test.com",
            authorPassword = "password123",
            teamId = 1L
        )

        // When & Then
        mockMvc.perform(
            post("/v1/community/posts/1/comments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.error.message").value("내용에 부적절한 표현이 포함되어 있습니다."))
    }

    @Test
    fun `깨끗한 댓글은 정상적으로 작성된다`() {
        // Given
        val cleanValidation = ProfanityFilterService.ValidationResult(
            isValid = true,
            violations = emptyList()
        )
        whenever(profanityFilterService.validateContent(any(), any())).thenReturn(cleanValidation)

        val request = CreateCommentRequest(
            content = "좋은 댓글입니다",
            authorName = "테스트",
            authorEmail = "test@test.com",
            authorPassword = "password123",
            teamId = 1L
        )

        // When & Then
        mockMvc.perform(
            post("/v1/community/posts/1/comments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
    }
}