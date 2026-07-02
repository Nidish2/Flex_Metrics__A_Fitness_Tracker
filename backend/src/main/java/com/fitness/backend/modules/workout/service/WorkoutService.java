package com.fitness.backend.modules.workout.service;

import com.fitness.backend.common.ResourceNotFoundException;
import com.fitness.backend.modules.auth.domain.User;
import com.fitness.backend.modules.workout.domain.*;
import com.fitness.backend.modules.workout.dto.*;
import com.fitness.backend.modules.workout.infra.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkoutService {

    private final WorkoutRepository workoutRepository;
    private final ExerciseRepository exerciseRepository;
    private final WorkoutExerciseRepository workoutExerciseRepository;
    private final WorkoutSetRepository workoutSetRepository;

    @Transactional
    public WorkoutDto startWorkout(User user, StartWorkoutRequest request) {
        Workout workout = Workout.builder()
                .user(user)
                .startTime(LocalDateTime.now())
                .note(request != null ? request.getNote() : null)
                .status(WorkoutStatus.IN_PROGRESS)
                .build();
        Workout saved = workoutRepository.save(workout);
        return mapToWorkoutDto(saved);
    }

    @Transactional
    public WorkoutExerciseDto addExerciseToWorkout(User user, UUID workoutId, AddExerciseRequest request) {
        Workout workout = workoutRepository.findById(workoutId)
                .orElseThrow(() -> new ResourceNotFoundException("Workout session not found"));
        
        // Enforce user ownership of this workout session
        if (!workout.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Access denied: You do not own this workout session");
        }

        Exercise exercise = exerciseRepository.findById(request.getExerciseId())
                .orElseThrow(() -> new ResourceNotFoundException("Exercise not found in catalog"));

        WorkoutExercise workoutExercise = WorkoutExercise.builder()
                .workout(workout)
                .exercise(exercise)
                .build();
        workout.addExercise(workoutExercise);

        WorkoutExercise saved = workoutExerciseRepository.save(workoutExercise);
        return mapToWorkoutExerciseDto(saved);
    }

    @Transactional
    public WorkoutSetDto addSetToExercise(User user, UUID workoutExerciseId, AddSetRequest request) {
        WorkoutExercise workoutExercise = workoutExerciseRepository.findById(workoutExerciseId)
                .orElseThrow(() -> new ResourceNotFoundException("Workout exercise log not found"));

        // Enforce user ownership of the parent workout
        if (!workoutExercise.getWorkout().getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Access denied: You do not own this workout session");
        }

        WorkoutSet workoutSet = WorkoutSet.builder()
                .workoutExercise(workoutExercise)
                .setNumber(request.getSetNumber())
                .weightKg(request.getWeightKg())
                .reps(request.getReps())
                .rpe(request.getRpe())
                .completed(false)
                .build();
        workoutExercise.addSet(workoutSet);

        WorkoutSet saved = workoutSetRepository.save(workoutSet);
        return mapToWorkoutSetDto(saved);
    }

    @Transactional
    public WorkoutSetDto updateSet(User user, UUID setId, UpdateSetRequest request) {
        WorkoutSet workoutSet = workoutSetRepository.findById(setId)
                .orElseThrow(() -> new ResourceNotFoundException("Workout set log not found"));

        // Enforce user ownership
        if (!workoutSet.getWorkoutExercise().getWorkout().getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Access denied: You do not own this workout session");
        }

        if (request.getWeightKg() != null) {
            workoutSet.setWeightKg(request.getWeightKg());
        }
        if (request.getReps() != null) {
            workoutSet.setReps(request.getReps());
        }
        if (request.getCompleted() != null) {
            workoutSet.setCompleted(request.getCompleted());
        }
        if (request.getRpe() != null) {
            workoutSet.setRpe(request.getRpe());
        }

        WorkoutSet saved = workoutSetRepository.save(workoutSet);
        return mapToWorkoutSetDto(saved);
    }

    @Transactional
    public WorkoutDto finishWorkout(User user, UUID workoutId, FinishWorkoutRequest request) {
        Workout workout = workoutRepository.findById(workoutId)
                .orElseThrow(() -> new ResourceNotFoundException("Workout session not found"));

        // Enforce user ownership
        if (!workout.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Access denied: You do not own this workout session");
        }

        workout.setEndTime(LocalDateTime.now());
        workout.setStatus(WorkoutStatus.COMPLETED);
        if (request != null && request.getNote() != null) {
            workout.setNote(request.getNote());
        }

        Workout saved = workoutRepository.save(workout);
        return mapToWorkoutDto(saved);
    }

    @Transactional(readOnly = true)
    public Page<WorkoutDto> getWorkoutHistory(User user, Pageable pageable) {
        return workoutRepository.findByUserIdOrderByStartTimeDesc(user.getId(), pageable)
                .map(this::mapToWorkoutDto);
    }

    @Transactional(readOnly = true)
    public WorkoutDto getWorkoutDetail(User user, UUID workoutId) {
        Workout workout = workoutRepository.findById(workoutId)
                .orElseThrow(() -> new ResourceNotFoundException("Workout session not found"));

        // Enforce user ownership
        if (!workout.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Access denied: You do not own this workout session");
        }

        return mapToWorkoutDto(workout);
    }

    private WorkoutDto mapToWorkoutDto(Workout w) {
        List<WorkoutExerciseDto> exercises = w.getExercises().stream()
                .map(this::mapToWorkoutExerciseDto)
                .collect(Collectors.toList());

        return WorkoutDto.builder()
                .id(w.getId())
                .startTime(w.getStartTime())
                .endTime(w.getEndTime())
                .note(w.getNote())
                .status(w.getStatus().name())
                .exercises(exercises)
                .build();
    }

    private WorkoutExerciseDto mapToWorkoutExerciseDto(WorkoutExercise we) {
        List<WorkoutSetDto> sets = we.getSets().stream()
                .map(this::mapToWorkoutSetDto)
                .collect(Collectors.toList());

        return WorkoutExerciseDto.builder()
                .id(we.getId())
                .exerciseId(we.getExercise().getId())
                .exerciseName(we.getExercise().getName())
                .sets(sets)
                .build();
    }

    private WorkoutSetDto mapToWorkoutSetDto(WorkoutSet ws) {
        return WorkoutSetDto.builder()
                .id(ws.getId())
                .setNumber(ws.getSetNumber())
                .weightKg(ws.getWeightKg())
                .reps(ws.getReps())
                .completed(ws.getCompleted())
                .rpe(ws.getRpe())
                .build();
    }
}
