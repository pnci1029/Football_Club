package io.be.stadium.domain

import io.be.stadium.domain.Stadium
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface StadiumRepository : JpaRepository<Stadium, Long>, StadiumRepositoryCustom {
    fun findByNameContaining(name: String): List<Stadium>
    fun findByAddressContaining(address: String): List<Stadium>
    fun findByTeamId(teamId: Long): List<Stadium>
    fun findByTeamId(teamId: Long, pageable: org.springframework.data.domain.Pageable): org.springframework.data.domain.Page<Stadium>
    
}