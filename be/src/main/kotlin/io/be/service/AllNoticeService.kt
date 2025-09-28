package io.be.service

import io.be.entity.Notice
import io.be.entity.Team
import io.be.repository.NoticeRepository
import io.be.repository.TeamRepository
import io.be.dto.AllNoticeResponse
import io.be.dto.TeamInfoResponse
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class AllNoticeService(
    private val noticeRepository: NoticeRepository,
    private val teamRepository: TeamRepository
) {

    /**
     * 전체 팀의 공지사항 목록 조회
     */
    fun getAllNotices(
        page: Int,
        size: Int,
        teamId: Long? = null,
        keyword: String? = null
    ): Page<AllNoticeResponse> {
        val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        
        val notices = when {
            teamId != null && !keyword.isNullOrBlank() -> {
                // 특정 팀 + 키워드 검색
                noticeRepository.findByTeamIdAndIsActiveTrueAndTitleContainingIgnoreCaseOrContentContainingIgnoreCase(
                    teamId, keyword, keyword, pageable
                )
            }
            teamId != null -> {
                // 특정 팀만
                noticeRepository.findByTeamIdAndIsActiveTrue(teamId, pageable)
            }
            !keyword.isNullOrBlank() -> {
                // 전체 팀 + 키워드 검색
                noticeRepository.findByIsActiveTrueAndTitleContainingIgnoreCaseOrContentContainingIgnoreCase(
                    keyword, keyword, pageable
                )
            }
            else -> {
                // 전체 팀의 모든 공지사항
                noticeRepository.findByIsActiveTrueOrderByCreatedAtDesc(pageable)
            }
        }

        return notices.map { notice ->
            val team = teamRepository.findById(notice.teamId).orElse(null)
            val commentCount = noticeRepository.countCommentsByNoticeId(notice.id)
            
            AllNoticeResponse.from(notice, team, commentCount)
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