package io.be.util

import org.slf4j.Logger
import org.slf4j.LoggerFactory

interface AppLogger {
    fun info(message: String)
    fun warn(message: String)
    fun error(message: String, throwable: Throwable? = null)
    fun debug(message: String)
}

class Slf4jLogger(private val logger: Logger) : AppLogger {
    override fun info(message: String) = logger.info(message)
    override fun warn(message: String) = logger.warn(message)
    override fun error(message: String, throwable: Throwable?) {
        if (throwable != null) {
            logger.error(message, throwable)
        } else {
            logger.error(message)
        }
    }
    override fun debug(message: String) = logger.debug(message)
}

inline fun <reified T> T.logger(): AppLogger = Slf4jLogger(LoggerFactory.getLogger(T::class.java))