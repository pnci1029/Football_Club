package io.be.repository.base

import com.querydsl.jpa.impl.JPAQuery
import com.querydsl.jpa.impl.JPAQueryFactory
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageImpl

abstract class BaseQueryRepository(
    protected val queryFactory: JPAQueryFactory
) {
    
    protected fun <T> fetchPageResponse(
        pageable: Pageable,
        contentQuery: JPAQuery<T>,
        countQuery: JPAQuery<Long>
    ): Page<T> {
        val adjustedPageable = PageRequest.of(
            maxOf(0, pageable.pageNumber),
            pageable.pageSize,
            pageable.sort
        )

        // 컨텐츠 조회
        val content = contentQuery
            .offset(adjustedPageable.offset)
            .limit(adjustedPageable.pageSize.toLong())
            .fetch()

        // 총 개수 조회
        val total = countQuery.fetchOne() ?: 0L

        return PageImpl(content, adjustedPageable, total)
    }
}