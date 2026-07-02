package com.fitness.backend.modules.auth.infra;

import com.fitness.backend.modules.auth.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    // Spring Data JPA magic: it knows how to write the SQL for this
    Optional<User> findByEmail(String email);
}