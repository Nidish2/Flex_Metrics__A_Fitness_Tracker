package com.fitness.backend.modules.workout.infra;

import com.fitness.backend.modules.workout.domain.WorkoutSet;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface WorkoutSetRepository extends JpaRepository<WorkoutSet, UUID> {
}
