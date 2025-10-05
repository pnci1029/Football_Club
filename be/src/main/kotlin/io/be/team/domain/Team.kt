package io.be.team.domain

import io.be.player.domain.Player
import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.time.LocalDateTime

@Entity
@Table(
    name = "teams",
    indexes = [
        Index(name = "idx_team_code_deleted", columnList = "code, isDeleted"),
        Index(name = "idx_team_name_deleted", columnList = "name, isDeleted")
    ]
)
data class Team(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    
    @Column(nullable = false, unique = true)
    val code: String, // 서브도메인용 코드 (team-a, team-b)
    
    @Column(nullable = false)
    val name: String,
    
    val description: String? = null,
    
    val logoUrl: String? = null,
    
    @CreationTimestamp
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @UpdateTimestamp
    val updatedAt: LocalDateTime = LocalDateTime.now(),
    
    val deletedAt: LocalDateTime? = null,
    
    val isDeleted: Boolean = false,
    
    @OneToMany(mappedBy = "team", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
    val players: List<Player> = listOf()
)