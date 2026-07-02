package com.fitness.backend.modules.nutrition.infra;

import com.fitness.backend.modules.nutrition.domain.Meal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface MealRepository extends JpaRepository<Meal, UUID> {
    List<Meal> findByUserIdOrderByLoggedAtDesc(UUID userId);
    List<Meal> findByUserIdAndLoggedAtBetween(UUID userId, LocalDateTime start, LocalDateTime end);
    List<Meal> findByUserIdAndLoggedAtBetweenOrderByLoggedAtDesc(UUID userId, LocalDateTime start, LocalDateTime end);
    Page<Meal> findByUserIdAndLoggedAtBetweenOrderByLoggedAtDesc(UUID userId, LocalDateTime start, LocalDateTime end, Pageable pageable);
}
