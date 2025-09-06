package io.be.entity

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.time.LocalDateTime

@Entity
@Table(name = "hero_slides")
data class HeroSlide(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    val team: Team,
    
    @Column(nullable = false, length = 100)
    val title: String,
    
    @Column(nullable = false, length = 200)
    val subtitle: String,
    
    @Column(length = 500)
    val backgroundImage: String? = null,
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val gradientColor: GradientColor = GradientColor.SLATE,
    
    @Column(nullable = false)
    val isActive: Boolean = true,
    
    @Column(nullable = false)
    val sortOrder: Int = 0,
    
    @CreationTimestamp
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @UpdateTimestamp
    val updatedAt: LocalDateTime = LocalDateTime.now()
)

enum class GradientColor {
    SLATE, BLUE, GREEN, PURPLE, RED
}