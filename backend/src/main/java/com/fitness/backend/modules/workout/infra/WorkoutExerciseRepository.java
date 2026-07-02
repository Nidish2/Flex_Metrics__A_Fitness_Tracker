package com.fitness.backend.modules.workout.infra;

import com.fitness.backend.modules.workout.domain.WorkoutExercise;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface WorkoutExerciseRepository extends JpaRepository<WorkoutExercise, UUID> {
}
