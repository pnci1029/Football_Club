package io.be.stadium.domain

import io.be.team.domain.Team
import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import java.time.LocalDateTime

@Entity
@Table(name = "stadiums")
data class Stadium(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    
    @Column(nullable = false)
    val name: String,
    
    @Column(nullable = false)
    val address: String,
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    val team: Team,
    
    val latitude: Double,
    val longitude: Double,
    
    @Column(columnDefinition = "TEXT")
    val facilities: String? = null, // JSON 형태로 시설 정보 저장
    
    val hourlyRate: Int? = null,
    
    @Column(columnDefinition = "TEXT")
    val availableHours: String? = null, // JSON 형태로 이용 가능 시간 저장
    
    @Column(columnDefinition = "TEXT")
    val availableDays: String? = null, // JSON 배열 형태로 이용 가능 요일 저장 (MONDAY, TUESDAY, ...)
    
    val contactNumber: String? = null,
    
    @Column(columnDefinition = "TEXT")
    val imageUrls: String? = null, // JSON 배열 형태로 이미지 URLs 저장
    
    @CreationTimestamp
    val createdAt: LocalDateTime = LocalDateTime.now()
)