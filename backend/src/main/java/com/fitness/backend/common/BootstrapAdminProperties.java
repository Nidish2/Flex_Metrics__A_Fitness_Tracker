package com.fitness.backend.common;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "application.security.bootstrap-admin")
public record BootstrapAdminProperties(
        boolean enabled,
        String email,
        String password,
        String firstName,
        String lastName
) {
}
