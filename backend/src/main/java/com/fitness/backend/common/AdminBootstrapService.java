package com.fitness.backend.common;

import com.fitness.backend.modules.auth.domain.Role;
import com.fitness.backend.modules.auth.domain.User;
import com.fitness.backend.modules.auth.infra.UserRepository;
import com.fitness.backend.modules.user.domain.UserProfile;
import com.fitness.backend.modules.user.infra.UserProfileRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminBootstrapService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${application.security.bootstrap-admin.enabled:false}")
    private boolean enabled;

    @Value("${application.security.bootstrap-admin.email:}")
    private String email;

    @Value("${application.security.bootstrap-admin.password:}")
    private String password;

    @Value("${application.security.bootstrap-admin.first-name:Admin}")
    private String firstName;

    @Value("${application.security.bootstrap-admin.last-name:User}")
    private String lastName;

    @PostConstruct
    public void bootstrapAdminUser() {
        if (!enabled) {
            return;
        }
        if (email == null || email.isBlank()
                || password == null || password.isBlank()) {
            throw new IllegalStateException("Bootstrap admin is enabled but email/password are missing");
        }

        userRepository.findByEmail(email).ifPresentOrElse(user -> {
            if (user.getRole() != Role.ADMIN) {
                user.setRole(Role.ADMIN);
                userRepository.save(user);
            }
        }, () -> {
            User admin = User.builder()
                    .firstName(firstName)
                    .lastName(lastName)
                    .email(email)
                    .password(passwordEncoder.encode(password))
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
            userProfileRepository.save(UserProfile.builder().user(admin).build());
        });
    }
}
