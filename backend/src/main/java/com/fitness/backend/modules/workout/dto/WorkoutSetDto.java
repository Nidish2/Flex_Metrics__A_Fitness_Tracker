package com.fitness.backend.modules.workout.dto;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutSetDto {
    private UUID id;
    private Integer setNumber;
    private Double weightKg;
    private Integer reps;
    private Boolean completed;
    private Integer rpe;
}
