package com.fitness.backend.modules.workout.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSetRequest {

    @PositiveOrZero(message = "Weight must be positive or zero")
    private Double weightKg;

    @PositiveOrZero(message = "Reps must be positive or zero")
    private Integer reps;

    private Boolean completed;

    @Min(value = 1, message = "RPE must be between 1 and 10")
    @Max(value = 10, message = "RPE must be between 1 and 10")
    private Integer rpe;
}
