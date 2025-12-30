package io.be.gallery.domain

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import java.time.LocalDateTime

@Entity
@Table(
    name = "highlight_metadata",
    indexes = [
        Index(name = "idx_highlight_gallery_id", columnList = "GALLERY_ID"),
        Index(name = "idx_highlight_match_id", columnList = "MATCH_ID"),
        Index(name = "idx_highlight_play_type", columnList = "PLAY_TYPE"),
        Index(name = "idx_highlight_rating", columnList = "HIGHLIGHT_RATING")
    ]
)
data class HighlightMetadata(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    
    @Column(name = "GALLERY_ID", nullable = false)
    val galleryId: Long,
    
    @Column(name = "MATCH_ID")
    val matchId: Long? = null,
    
    @Enumerated(EnumType.STRING)
    @Column(name = "PLAY_TYPE", nullable = false)
    val playType: PlayType,
    
    @Column(name = "PLAYER_NAMES", length = 200)
    val playerNames: String? = null,
    
    @Column(name = "GAME_MINUTE")
    val gameMinute: Int? = null,
    
    @Column(name = "DESCRIPTION", columnDefinition = "TEXT")
    val description: String? = null,
    
    @Column(name = "HIGHLIGHT_RATING")
    val highlightRating: Int = 0, // 1-5점 하이라이트 중요도
    
    @CreationTimestamp
    @Column(name = "CREATED_AT", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
)

enum class PlayType(
    val displayName: String,
    val description: String
) {
    GOAL("골", "득점 장면"),
    ASSIST("어시스트", "도움 장면"),
    SAVE("선방", "골키퍼 선방 장면"),
    TACKLE("태클", "수비 태클 장면"),
    SKILL("기술", "개인 기술 장면"),
    TEAM_PLAY("팀플레이", "팀 연계 플레이"),
    CARD("카드", "경고/퇴장 장면"),
    CELEBRATION("세리머니", "득점 후 세리머니"),
    FOUL("파울", "파울 장면"),
    FREE_KICK("프리킥", "프리킥 장면"),
    CORNER_KICK("코너킥", "코너킥 장면"),
    PENALTY("페널티킥", "페널티킥 장면"),
    OTHER("기타", "기타 하이라이트")
}