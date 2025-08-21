package io.be.repository

import io.be.entity.Team
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface TeamRepository : JpaRepository<Team, Long> {
    fun findByCode(code: String): Team?
    fun findByNameContaining(name: String): List<Team>
    fun existsByCode(code: String): Boolean
    fun existsByName(name: String): Boolean
}