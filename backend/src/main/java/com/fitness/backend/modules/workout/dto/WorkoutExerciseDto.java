package com.fitness.backend.modules.workout.dto;

import lombok.*;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutExerciseDto {
    private UUID id;
    private UUID exerciseId;
    private String exerciseName;
    private List<WorkoutSetDto> sets;
}
