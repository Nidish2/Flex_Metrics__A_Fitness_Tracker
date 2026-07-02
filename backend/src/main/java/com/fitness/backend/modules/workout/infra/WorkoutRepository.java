package com.fitness.backend.modules.workout.infra;

import com.fitness.backend.modules.workout.domain.Workout;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface WorkoutRepository extends JpaRepository<Workout, UUID> {
    List<Workout> findByUserId(UUID userId);
    Page<Workout> findByUserIdOrderByStartTimeDesc(UUID userId, Pageable pageable);
}
