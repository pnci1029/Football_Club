package io.be.integration

import org.junit.jupiter.api.Test
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.TestPropertySource

@SpringBootTest
@TestPropertySource(properties = [
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.datasource.url=jdbc:h2:mem:testdb"
])
class ApplicationContextTest {

    @Test
    fun `application context should load successfully`() {
        // This test verifies that the Spring application context loads without errors
        // If the context fails to load, the test will fail
    }
}