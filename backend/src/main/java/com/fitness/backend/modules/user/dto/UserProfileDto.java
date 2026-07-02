package com.fitness.backend.modules.user.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDto {

    @NotNull(message = "Height is required")
    @Positive(message = "Height must be positive")
    private Double heightCm;

    @NotNull(message = "Birth date is required")
    private LocalDate birthDate;

    @NotBlank(message = "Biological sex is required")
    private String biologicalSex;

    @NotBlank(message = "Activity level is required")
    private String activityLevel;

    @Min(value = 500, message = "Daily calorie target must be at least 500")
    private Integer dailyCalorieGoal;

    private Integer dailyProteinGoal;
    private Integer dailyCarbsGoal;
    private Integer dailyFatGoal;
}
