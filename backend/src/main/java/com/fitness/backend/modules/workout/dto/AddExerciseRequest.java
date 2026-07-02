package com.fitness.backend.modules.workout.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddExerciseRequest {
    @NotNull(message = "Exercise ID is required")
    private UUID exerciseId;
}
