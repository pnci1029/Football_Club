package io.be.admin.application

import io.be.admin.dto.CommunityPostDto
import io.be.community.application.CommunityService
import io.be.community.domain.Community
import io.be.community.domain.CommunityRepository
import io.be.shared.exception.ResourceNotFoundException
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.*
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import java.time.LocalDateTime
import java.util.*
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class AdminCommunityServiceTest {

    private val communityRepository = mock<CommunityRepository>()
    private val communityService = mock<CommunityService>()

    private val adminCommunityService = AdminCommunityService(communityRepository, communityService)

    @Test
    fun `서브도메인별 커뮤니티 게시글 조회 성공`() {
        val post1 = Community(
            id = 1L,
            title = "Post 1",
            content = "Content 1",
            teamSubdomain = "team1",
            isVisible = true,
            createdAt = LocalDateTime.now()
        )
        val post2 = Community(
            id = 2L,
            title = "Post 2", 
            content = "Content 2",
            teamSubdomain = "team1",
            isVisible = true,
            createdAt = LocalDateTime.now()
        )
        val page = PageImpl(listOf(post1, post2), PageRequest.of(0, 10), 2)

        whenever(communityRepository.findByTeamSubdomainOrderByCreatedAtDesc("team1", PageRequest.of(0, 10)))
            .thenReturn(page)

        val result = adminCommunityService.getCommunityPostsByTeam("team1", PageRequest.of(0, 10))

        assertEquals(2, result.content.size)
        assertEquals("Post 1", result.content[0].title)
        assertEquals("Post 2", result.content[1].title)
    }

    @Test
    fun `게시글 숨김 처리 성공`() {
        val post = Community(
            id = 1L,
            title = "Visible Post",
            content = "Content",
            teamSubdomain = "team1",
            isVisible = true,
            createdAt = LocalDateTime.now()
        )

        whenever(communityRepository.findById(1L)).thenReturn(Optional.of(post))
        whenever(communityRepository.save(any<Community>())).thenAnswer { it.arguments[0] as Community }

        val result = adminCommunityService.hidePost(1L)

        assertFalse(result.isVisible)
        verify(communityRepository).save(argThat<Community> { !isVisible })
    }

    @Test
    fun `이미 숨겨진 게시글 다시 표시 성공`() {
        val hiddenPost = Community(
            id = 1L,
            title = "Hidden Post",
            content = "Content",
            teamSubdomain = "team1",
            isVisible = false,
            createdAt = LocalDateTime.now()
        )

        whenever(communityRepository.findById(1L)).thenReturn(Optional.of(hiddenPost))
        whenever(communityRepository.save(any<Community>())).thenAnswer { it.arguments[0] as Community }

        val result = adminCommunityService.showPost(1L)

        assertTrue(result.isVisible)
        verify(communityRepository).save(argThat<Community> { isVisible })
    }

    @Test
    fun `게시글 삭제 성공`() {
        val post = Community(
            id = 1L,
            title = "Post to Delete",
            content = "Content",
            teamSubdomain = "team1",
            isVisible = true,
            createdAt = LocalDateTime.now()
        )

        whenever(communityRepository.findById(1L)).thenReturn(Optional.of(post))
        doNothing().whenever(communityRepository).delete(post)

        adminCommunityService.deletePost(1L)

        verify(communityRepository).delete(post)
    }

    @Test
    fun `존재하지 않는 게시글 삭제 시도시 실패`() {
        whenever(communityRepository.findById(999L)).thenReturn(Optional.empty())

        assertThrows<ResourceNotFoundException> {
            adminCommunityService.deletePost(999L)
        }

        verify(communityRepository, never()).delete(any<Community>())
    }

    @Test
    fun `숨겨진 게시글만 조회 성공`() {
        val hiddenPost1 = Community(
            id = 1L,
            title = "Hidden Post 1",
            content = "Content 1",
            teamSubdomain = "team1",
            isVisible = false,
            createdAt = LocalDateTime.now()
        )
        val hiddenPost2 = Community(
            id = 2L,
            title = "Hidden Post 2",
            content = "Content 2", 
            teamSubdomain = "team1",
            isVisible = false,
            createdAt = LocalDateTime.now()
        )
        val page = PageImpl(listOf(hiddenPost1, hiddenPost2), PageRequest.of(0, 10), 2)

        whenever(communityRepository.findByTeamSubdomainAndIsVisibleOrderByCreatedAtDesc("team1", false, PageRequest.of(0, 10)))
            .thenReturn(page)

        val result = adminCommunityService.getHiddenPostsByTeam("team1", PageRequest.of(0, 10))

        assertEquals(2, result.content.size)
        result.content.forEach { post ->
            assertFalse(post.isVisible)
        }
    }

    @Test
    fun `신고된 게시글 조회 성공`() {
        val reportedPost = Community(
            id = 1L,
            title = "Reported Post",
            content = "Inappropriate content",
            teamSubdomain = "team1",
            isVisible = true,
            reportCount = 5,
            createdAt = LocalDateTime.now()
        )
        val page = PageImpl(listOf(reportedPost), PageRequest.of(0, 10), 1)

        whenever(communityRepository.findByTeamSubdomainAndReportCountGreaterThanOrderByReportCountDesc("team1", 0, PageRequest.of(0, 10)))
            .thenReturn(page)

        val result = adminCommunityService.getReportedPostsByTeam("team1", PageRequest.of(0, 10))

        assertEquals(1, result.content.size)
        assertEquals("Reported Post", result.content[0].title)
        assertEquals(5, result.content[0].reportCount)
    }

    @Test
    fun `게시글 일괄 삭제 성공`() {
        val post1 = Community(
            id = 1L,
            title = "Post 1",
            content = "Content 1",
            teamSubdomain = "team1",
            isVisible = true,
            createdAt = LocalDateTime.now()
        )
        val post2 = Community(
            id = 2L,
            title = "Post 2",
            content = "Content 2",
            teamSubdomain = "team1", 
            isVisible = true,
            createdAt = LocalDateTime.now()
        )

        whenever(communityRepository.findById(1L)).thenReturn(Optional.of(post1))
        whenever(communityRepository.findById(2L)).thenReturn(Optional.of(post2))
        doNothing().whenever(communityRepository).deleteAll(listOf(post1, post2))

        adminCommunityService.bulkDeletePosts(listOf(1L, 2L))

        verify(communityRepository).deleteAll(listOf(post1, post2))
    }

    @Test
    fun `게시글 일괄 숨김 처리 성공`() {
        val post1 = Community(
            id = 1L,
            title = "Post 1",
            content = "Content 1",
            teamSubdomain = "team1",
            isVisible = true,
            createdAt = LocalDateTime.now()
        )
        val post2 = Community(
            id = 2L,
            title = "Post 2",
            content = "Content 2",
            teamSubdomain = "team1",
            isVisible = true,
            createdAt = LocalDateTime.now()
        )

        whenever(communityRepository.findById(1L)).thenReturn(Optional.of(post1))
        whenever(communityRepository.findById(2L)).thenReturn(Optional.of(post2))
        whenever(communityRepository.saveAll(any<List<Community>>())).thenAnswer { it.arguments[0] as List<Community> }

        val result = adminCommunityService.bulkHidePosts(listOf(1L, 2L))

        assertEquals(2, result.size)
        result.forEach { post ->
            assertFalse(post.isVisible)
        }
        verify(communityRepository).saveAll(any<List<Community>>())
    }
}