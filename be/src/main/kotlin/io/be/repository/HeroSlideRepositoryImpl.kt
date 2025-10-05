package io.be.repository

import com.querydsl.jpa.impl.JPAQueryFactory
import io.be.entity.QHeroSlide.heroSlide
import io.be.repository.base.BaseQueryRepository
import org.springframework.stereotype.Repository

@Repository
class HeroSlideRepositoryImpl(
    queryFactory: JPAQueryFactory
) : BaseQueryRepository(queryFactory), HeroSlideRepositoryCustom {

    override fun updateSortOrder(id: Long, sortOrder: Int) {
        queryFactory
            .update(heroSlide)
            .set(heroSlide.sortOrder, sortOrder)
            .where(heroSlide.id.eq(id))
            .execute()
    }
}