package io.be.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "matches")
data class Match(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "home_team_id", nullable = false)
    val homeTeam: Team,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "away_team_id", nullable = false)
    val awayTeam: Team,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stadium_id", nullable = false)
    val stadium: Stadium,

    @Column(name = "match_date", nullable = false)
    val matchDate: LocalDateTime,

    @Column(name = "home_team_score")
    val homeTeamScore: Int? = null,

    @Column(name = "away_team_score")
    val awayTeamScore: Int? = null,

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    val status: MatchStatus = MatchStatus.SCHEDULED,

    @Column(name = "created_at", updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at")
    val updatedAt: LocalDateTime = LocalDateTime.now()
)

enum class MatchStatus {
    SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
}
