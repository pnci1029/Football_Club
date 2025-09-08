package io.be.entity

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.time.LocalDateTime

@Entity
@Table(
    name = "players",
    indexes = [
        Index(name = "idx_player_team_deleted", columnList = "team_id, isDeleted"),
        Index(name = "idx_player_team_back_number", columnList = "team_id, backNumber", unique = true),
        Index(name = "idx_player_position_active", columnList = "position, isActive, isDeleted")
    ]
)
data class Player(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false)
    val name: String,

    @Column(nullable = false)
    val position: String, // GK, DF, MF, FW

    val profileImageUrl: String? = null,

    val backNumber: Int? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    val team: Team,

    val isActive: Boolean = true,

    @CreationTimestamp
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @UpdateTimestamp
    val updatedAt: LocalDateTime = LocalDateTime.now(),

    val deletedAt: LocalDateTime? = null,

    val isDeleted: Boolean = false
)
