package com.fitness.backend.modules.nutrition.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MealItemDto {
    private UUID id;

    @NotBlank(message = "Food name is required")
    private String foodName;

    @NotNull(message = "Calories is required")
    @PositiveOrZero(message = "Calories must be positive or zero")
    private Integer calories;

    private Double proteinG;
    private Double carbsG;
    private Double fatG;

    @NotNull(message = "Serving size is required")
    @Positive(message = "Serving size must be positive")
    private Double servingSizeG;

    @NotNull(message = "Servings count is required")
    @Positive(message = "Servings count must be positive")
    private Double servingsCount;
}
