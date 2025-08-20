package io.be.entity

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import java.time.LocalDateTime

@Entity
@Table(name = "teams")
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
    
    @OneToMany(mappedBy = "team", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
    val players: List<Player> = listOf()
)