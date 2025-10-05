package io.be.inquiry.domain

import com.querydsl.core.types.dsl.BooleanExpression
import com.querydsl.jpa.impl.JPAQuery
import com.querydsl.jpa.impl.JPAQueryFactory
import io.be.inquiry.domain.Inquiry
import io.be.inquiry.domain.InquiryStatus
// import io.be.inquiry.domain.QInquiry
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.support.PageableExecutionUtils
import org.springframework.stereotype.Repository

@Repository
class InquiryRepositoryImpl(
    private val queryFactory: JPAQueryFactory
) : InquiryRepositoryCustom {

    // TODO: QueryDSL Q클래스 생성 후 활성화
    // private val qInquiry = QInquiry.inquiry

    override fun findRecentInquiries(pageable: Pageable): Page<Inquiry> {
        // TODO: QueryDSL Q클래스 생성 후 활성화
        TODO("QueryDSL Q클래스 생성 후 구현")
        /*
        val query = queryFactory
            .selectFrom(qInquiry)
            .orderBy(qInquiry.createdAt.desc())
            .offset(pageable.offset)
            .limit(pageable.pageSize.toLong())

        val inquiries = query.fetch()
        val countQuery = queryFactory
            .select(qInquiry.count())
            .from(qInquiry)

        return PageableExecutionUtils.getPage(inquiries, pageable) { countQuery.fetchOne() ?: 0L }
        */
    }

    override fun searchInquiries(
        name: String?,
        email: String?,
        teamName: String?,
        status: InquiryStatus?,
        pageable: Pageable
    ): Page<Inquiry> {
        // TODO: QueryDSL Q클래스 생성 후 활성화
        TODO("QueryDSL Q클래스 생성 후 구현")
        /*
        val query = queryFactory
            .selectFrom(qInquiry)
            .where(
                nameContains(name),
                emailContains(email),
                teamNameContains(teamName),
                statusEquals(status)
            )
            .orderBy(qInquiry.createdAt.desc())
            .offset(pageable.offset)
            .limit(pageable.pageSize.toLong())

        val inquiries = query.fetch()

        val countQuery = queryFactory
            .select(qInquiry.count())
            .from(qInquiry)
            .where(
                nameContains(name),
                emailContains(email),
                teamNameContains(teamName),
                statusEquals(status)
            )

        return PageableExecutionUtils.getPage(inquiries, pageable) { countQuery.fetchOne() ?: 0L }
        */
    }

    // TODO: QueryDSL Q클래스 생성 후 활성화
    /*
    private fun nameContains(name: String?): BooleanExpression? {
        return if (name.isNullOrBlank()) null else qInquiry.name.containsIgnoreCase(name)
    }

    private fun emailContains(email: String?): BooleanExpression? {
        return if (email.isNullOrBlank()) null else qInquiry.email.containsIgnoreCase(email)
    }

    private fun teamNameContains(teamName: String?): BooleanExpression? {
        return if (teamName.isNullOrBlank()) null else qInquiry.teamName.containsIgnoreCase(teamName)
    }

    private fun statusEquals(status: InquiryStatus?): BooleanExpression? {
        return if (status == null) null else qInquiry.status.eq(status)
    }
    */
}