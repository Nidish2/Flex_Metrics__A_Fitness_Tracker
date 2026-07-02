package com.fitness.backend.modules.workout.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddSetRequest {
    
    @NotNull(message = "Set number is required")
    @Positive(message = "Set number must be positive")
    private Integer setNumber;

    @PositiveOrZero(message = "Weight must be positive or zero")
    private Double weightKg;

    @NotNull(message = "Reps is required")
    @PositiveOrZero(message = "Reps must be positive or zero")
    private Integer reps;

    @Min(value = 1, message = "RPE must be between 1 and 10")
    @Max(value = 10, message = "RPE must be between 1 and 10")
    private Integer rpe;
}
