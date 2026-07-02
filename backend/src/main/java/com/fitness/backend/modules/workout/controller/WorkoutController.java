package com.fitness.backend.modules.workout.controller;

import com.fitness.backend.modules.auth.domain.User;
import com.fitness.backend.modules.workout.dto.*;
import com.fitness.backend.modules.workout.service.WorkoutService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/workouts")
@RequiredArgsConstructor
public class WorkoutController {

    private final WorkoutService workoutService;

    @PostMapping
    public ResponseEntity<WorkoutDto> startWorkout(
            @AuthenticationPrincipal User user,
            @RequestBody(required = false) StartWorkoutRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(workoutService.startWorkout(user, request));
    }

    @PostMapping("/{id}/exercises")
    public ResponseEntity<WorkoutExerciseDto> addExerciseToWorkout(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id,
            @Valid @RequestBody AddExerciseRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(workoutService.addExerciseToWorkout(user, id, request));
    }

    @PostMapping("/exercises/{id}/sets")
    public ResponseEntity<WorkoutSetDto> addSetToExercise(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id,
            @Valid @RequestBody AddSetRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(workoutService.addSetToExercise(user, id, request));
    }

    @PutMapping("/sets/{id}")
    public ResponseEntity<WorkoutSetDto> updateSet(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateSetRequest request
    ) {
        return ResponseEntity.ok(workoutService.updateSet(user, id, request));
    }

    @PostMapping("/{id}/finish")
    public ResponseEntity<WorkoutDto> finishWorkout(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id,
            @RequestBody(required = false) FinishWorkoutRequest request
    ) {
        return ResponseEntity.ok(workoutService.finishWorkout(user, id, request));
    }

    @GetMapping
    public ResponseEntity<Page<WorkoutDto>> getWorkoutHistory(
            @AuthenticationPrincipal User user,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(workoutService.getWorkoutHistory(user, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkoutDto> getWorkoutDetail(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(workoutService.getWorkoutDetail(user, id));
    }
}
