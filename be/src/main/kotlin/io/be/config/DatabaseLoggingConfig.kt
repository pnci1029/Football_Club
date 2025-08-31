package io.be.config

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.CommandLineRunner
import org.springframework.stereotype.Component
import javax.sql.DataSource

@Component
class DatabaseLoggingConfig(
    @Autowired private val dataSource: DataSource
) : CommandLineRunner {
    
    private val logger = LoggerFactory.getLogger(DatabaseLoggingConfig::class.java)
    
    override fun run(vararg args: String?) {
        try {
            dataSource.connection.use { connection ->
                val databaseProductName = connection.metaData.databaseProductName
                val databaseProductVersion = connection.metaData.databaseProductVersion
                val url = connection.metaData.url
                val userName = connection.metaData.userName
                
                logger.info("🗄️ ========== DATABASE INFO ==========")
                logger.info("🗄️ Database: $databaseProductName")
                logger.info("🗄️ Version: $databaseProductVersion") 
                logger.info("🗄️ URL: $url")
                logger.info("🗄️ User: $userName")
                logger.info("🗄️ ====================================")
            }
        } catch (e: Exception) {
            logger.error("❌ Failed to get database information", e)
        }
    }
}