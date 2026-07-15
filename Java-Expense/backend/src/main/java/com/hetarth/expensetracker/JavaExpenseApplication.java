package com.hetarth.expensetracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main application entry point that boots the Spring Container.
 * The @SpringBootApplication annotation encapsulates:
 * 1. @SpringBootConfiguration (declares this class as a configuration source)
 * 2. @EnableAutoConfiguration (tells Spring to auto-setup libraries based on classpath dependencies)
 * 3. @ComponentScan (automatically scans sub-packages com.hetarth.expensetracker.* for @Component, @Service, @Controller, @Repository beans)
 */
@SpringBootApplication
public class JavaExpenseApplication {

    public static void main(String[] args) {
        SpringApplication.run(JavaExpenseApplication.class, args);
    }
}
