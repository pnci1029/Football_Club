package io.be.community.application

import io.be.community.domain.CommunityPost
import io.be.team.domain.Team
import io.be.community.domain.CommunityPostRepository
import io.be.team.domain.TeamRepository
import io.be.community.dto.AllCommunityPostResponse
import io.be.community.dto.TeamInfoResponse
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class AllCommunityService(
    private val communityPostRepository: CommunityPostRepository,
    private val teamRepository: TeamRepository
) {

    /**
     * 전체 팀의 커뮤니티 게시글 목록 조회
     */
    fun getAllCommunityPosts(
        page: Int,
        size: Int,
        teamId: Long? = null,
        keyword: String? = null
    ): Page<AllCommunityPostResponse> {
        val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        
        val posts = when {
            teamId != null && !keyword.isNullOrBlank() -> {
                // 특정 팀 + 키워드 검색
                communityPostRepository.findByTeamIdAndKeyword(teamId, keyword, pageable)
            }
            teamId != null -> {
                // 특정 팀만
                communityPostRepository.findByTeamIdAndIsActiveTrue(teamId, pageable)
            }
            !keyword.isNullOrBlank() -> {
                // 전체 팀 + 키워드 검색
                communityPostRepository.findByKeyword(keyword, pageable)
            }
            else -> {
                // 전체 팀의 모든 게시글
                communityPostRepository.findByIsActiveTrueOrderByCreatedAtDesc(pageable)
            }
        }

        return posts.map { post ->
            val team = teamRepository.findById(post.teamId).orElse(null)
            val commentCount = communityPostRepository.countCommentsByPostId(post.id)
            
            AllCommunityPostResponse.from(post, team, commentCount)
        }
    }
    

    /**
     * 활성 팀 목록 조회
     */
    fun getActiveTeams(): List<TeamInfoResponse> {
        return teamRepository.findAllByIsDeletedFalse()
            .map { team -> TeamInfoResponse.from(team) }
    }
}