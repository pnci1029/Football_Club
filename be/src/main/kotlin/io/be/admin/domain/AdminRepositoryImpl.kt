package io.be.admin.domain

import com.querydsl.jpa.impl.JPAQueryFactory
import io.be.admin.domain.QAdmin.admin
import io.be.shared.base.BaseQueryRepository
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

@Repository
class AdminRepositoryImpl(
    queryFactory: JPAQueryFactory
) : BaseQueryRepository(queryFactory), AdminRepositoryCustom {

    override fun updateLastLoginTime(adminId: Long, loginTime: LocalDateTime) {
        queryFactory
            .update(admin)
            .set(admin.lastLoginAt, loginTime)
            .where(admin.id.eq(adminId))
            .execute()
    }
}