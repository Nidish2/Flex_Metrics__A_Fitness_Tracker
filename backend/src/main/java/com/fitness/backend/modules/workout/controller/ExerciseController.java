package com.fitness.backend.modules.workout.controller;

import com.fitness.backend.modules.workout.domain.Exercise;
import com.fitness.backend.modules.workout.dto.ExerciseDto;
import com.fitness.backend.modules.workout.infra.ExerciseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/exercises")
@RequiredArgsConstructor
public class ExerciseController {

    private final ExerciseRepository exerciseRepository;

    @GetMapping
    public ResponseEntity<Page<ExerciseDto>> getAllExercises(
            @RequestParam(required = false, defaultValue = "") String muscleGroup,
            @RequestParam(required = false, defaultValue = "") String equipment,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<Exercise> page = exerciseRepository
                .findByMuscleGroupContainingIgnoreCaseAndEquipmentContainingIgnoreCase(muscleGroup, equipment, pageable);

        Page<ExerciseDto> dtoPage = page.map(e -> ExerciseDto.builder()
                .id(e.getId())
                .name(e.getName())
                .description(e.getDescription())
                .muscleGroup(e.getMuscleGroup())
                .equipment(e.getEquipment())
                .imageUrl(e.getImageUrl())
                .build());

        return ResponseEntity.ok(dtoPage);
    }
}