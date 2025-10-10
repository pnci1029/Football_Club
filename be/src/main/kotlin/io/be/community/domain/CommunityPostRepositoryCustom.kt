package io.be.community.domain

import io.be.community.domain.CommunityPost
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable

interface CommunityPostRepositoryCustom {
    
    // 팀별 게시글 검색 (키워드)
    fun findByTeamIdAndKeyword(teamId: Long, keyword: String, pageable: Pageable): Page<CommunityPost>
    
    // 팀별 카테고리 게시글 검색 (키워드)
    fun findByTeamIdAndCategoryAndKeyword(teamId: Long, category: CommunityCategory, keyword: String, pageable: Pageable): Page<CommunityPost>
    
    // 전체 팀 게시글 검색 (키워드)
    fun findByKeyword(keyword: String, pageable: Pageable): Page<CommunityPost>
    
    // 조회수 증가
    fun incrementViewCount(id: Long)
    
    // 조회수 증가 (지정값)
    fun incrementViewCountBy(id: Long, increment: Long)
    
    // 특정 게시글의 댓글 수 조회
    fun countCommentsByPostId(postId: Long): Long
}