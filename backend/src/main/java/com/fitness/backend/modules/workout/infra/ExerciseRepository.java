package com.fitness.backend.modules.workout.infra;

import com.fitness.backend.modules.workout.domain.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface ExerciseRepository extends JpaRepository<Exercise, UUID> {
    Optional<Exercise> findByName(String name);
    boolean existsByExternalId(Long externalId);
    
    Page<Exercise> findByMuscleGroupContainingIgnoreCaseAndEquipmentContainingIgnoreCase(
            String muscleGroup, String equipment, Pageable pageable);
}