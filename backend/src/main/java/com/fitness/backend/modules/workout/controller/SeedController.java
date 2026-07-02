package com.fitness.backend.modules.workout.controller;

import com.fitness.backend.modules.workout.service.ExerciseSeederService;
import com.fitness.backend.modules.workout.dto.SeedExercisesResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class SeedController {

    private final ExerciseSeederService seederService;

    @PostMapping("/seed-exercises")
    public ResponseEntity<SeedExercisesResponseDto> seedExercises() {
        int count = seederService.seedExercises();
        return ResponseEntity.ok(SeedExercisesResponseDto.builder()
                .message("Seeding successful")
                .count(count)
                .build());
    }
}
