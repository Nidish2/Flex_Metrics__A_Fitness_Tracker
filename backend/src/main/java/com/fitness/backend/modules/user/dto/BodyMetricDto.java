package com.fitness.backend.modules.user.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BodyMetricDto {

    private String id;

    @NotNull(message = "Weight is required")
    @Positive(message = "Weight must be positive")
    private Double weightKg;

    @Positive(message = "Body fat percentage must be positive")
    private Double bodyFatPercentage;

    private LocalDateTime loggedAt;
}
