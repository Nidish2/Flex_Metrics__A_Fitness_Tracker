package com.fitness.backend.modules.workout.dto;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExerciseDto {
    private UUID id;
    private String name;
    private String description;
    private String muscleGroup;
    private String equipment;
    private String imageUrl;
}
