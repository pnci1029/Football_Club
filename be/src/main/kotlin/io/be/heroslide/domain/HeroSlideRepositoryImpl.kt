package io.be.heroslide.domain

import com.querydsl.jpa.impl.JPAQueryFactory
// import io.be.heroslide.domain.QHeroSlide.heroSlide
import io.be.shared.base.BaseQueryRepository
import org.springframework.stereotype.Repository

@Repository
class HeroSlideRepositoryImpl(
    queryFactory: JPAQueryFactory
) : /* BaseQueryRepository(queryFactory), */ HeroSlideRepositoryCustom {

    override fun updateSortOrder(id: Long, sortOrder: Int) {
        // TODO: QueryDSL Q클래스 생성 후 활성화
        TODO("QueryDSL Q클래스 생성 후 구현")
        /*
        queryFactory
            .update(heroSlide)
            .set(heroSlide.sortOrder, sortOrder)
            .where(heroSlide.id.eq(id))
            .execute()
        */
    }
}