package com.fitness.backend.modules.nutrition.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MealDto {
    private UUID id;

    @NotBlank(message = "Meal name is required")
    private String name;

    private LocalDateTime loggedAt;

    @NotEmpty(message = "Meal must contain at least one item")
    @Valid
    private List<MealItemDto> items;
}
