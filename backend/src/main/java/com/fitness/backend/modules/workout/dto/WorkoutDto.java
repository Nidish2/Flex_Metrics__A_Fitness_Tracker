package com.fitness.backend.modules.workout.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutDto {
    private UUID id;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String note;
    private String status;
    private List<WorkoutExerciseDto> exercises;
}
