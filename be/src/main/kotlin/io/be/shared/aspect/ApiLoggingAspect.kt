package io.be.shared.aspect

import io.be.shared.util.ApiResponse
import jakarta.servlet.http.HttpServletRequest
import org.aspectj.lang.JoinPoint
import org.aspectj.lang.ProceedingJoinPoint
import org.aspectj.lang.annotation.*
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Component
import org.springframework.web.context.request.RequestContextHolder
import org.springframework.web.context.request.ServletRequestAttributes

@Aspect
@Component
class ApiLoggingAspect {

    private val logger = LoggerFactory.getLogger(ApiLoggingAspect::class.java)

    @Pointcut("within(@org.springframework.web.bind.annotation.RestController *)")
    fun restController() {}

    @Pointcut("@annotation(org.springframework.web.bind.annotation.GetMapping) || " +
              "@annotation(org.springframework.web.bind.annotation.PostMapping) || " +
              "@annotation(org.springframework.web.bind.annotation.PutMapping) || " +
              "@annotation(org.springframework.web.bind.annotation.DeleteMapping) || " +
              "@annotation(org.springframework.web.bind.annotation.PatchMapping) || " +
              "@annotation(org.springframework.web.bind.annotation.RequestMapping)")
    fun apiMethod() {}

    @Around("restController() && apiMethod()")
    fun logApiCall(joinPoint: ProceedingJoinPoint): Any? {
        println("ㅡㅡㅡㅡㅡㅡ")
        val startTime = System.currentTimeMillis()

        // 요청 정보 추출
        val request = getHttpServletRequest()
        val method = request?.method ?: "UNKNOWN"
        val uri = request?.requestURI ?: "UNKNOWN"
        val queryString = request?.queryString
        val fullUrl = if (queryString != null) "$uri?$queryString" else uri
        val remoteAddr = request?.remoteAddr ?: "UNKNOWN"

        // 클래스명과 메소드명
        val className = joinPoint.signature.declaringType.simpleName
        val methodName = joinPoint.signature.name

        // 파라미터 정보
        val args = joinPoint.args
        val paramInfo = if (args.isNotEmpty()) {
            args.mapIndexed { index, arg ->
                when (arg) {
                    is HttpServletRequest -> "[HttpServletRequest]"
                    else -> "$index:${arg?.toString()?.take(100)}"
                }
            }.joinToString(", ")
        } else "No parameters"

        logger.info("🌐 API REQUEST - $method $fullUrl | Controller: $className.$methodName | IP: $remoteAddr | Params: $paramInfo")

        return try {
            val result = joinPoint.proceed()
            val duration = System.currentTimeMillis() - startTime

            // 응답 정보 로깅
            when (result) {
                is ResponseEntity<*> -> {
                    val statusCode = result.statusCode.value()
                    val body = result.body

                    val responseInfo = when (body) {
                        is ApiResponse<*> -> {
                            if (body.success) {
                                "SUCCESS"
                            } else {
                                "ERROR: ${body.error?.code} - ${body.error?.message}"
                            }
                        }
                        else -> "Response body present"
                    }

                    logger.info("✅ API RESPONSE - $method $fullUrl | Status: $statusCode | Duration: ${duration}ms | Result: $responseInfo")
                }
                else -> {
                    logger.info("✅ API RESPONSE - $method $fullUrl | Duration: ${duration}ms | Result: Non-ResponseEntity")
                }
            }

            result
        } catch (ex: Exception) {
            val duration = System.currentTimeMillis() - startTime
            logger.error("❌ API ERROR - $method $fullUrl | Duration: ${duration}ms | Error: ${ex.javaClass.simpleName}: ${ex.message}", ex)
            throw ex
        }
    }

    private fun getHttpServletRequest(): HttpServletRequest? {
        return try {
            val requestAttributes = RequestContextHolder.currentRequestAttributes() as ServletRequestAttributes
            requestAttributes.request
        } catch (ex: Exception) {
            null
        }
    }
}
