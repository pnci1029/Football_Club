package io.be

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.context.annotation.EnableAspectJAutoProxy

@SpringBootApplication
@EnableAspectJAutoProxy
class BeApplication

fun main(args: Array<String>) {
    runApplication<BeApplication>(*args)
}
