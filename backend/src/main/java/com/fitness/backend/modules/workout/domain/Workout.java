package com.fitness.backend.modules.workout.domain;

import com.fitness.backend.modules.auth.domain.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "workouts")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Workout {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private String note;
    
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private WorkoutStatus status = WorkoutStatus.IN_PROGRESS;

    @OneToMany(mappedBy = "workout", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<WorkoutExercise> exercises = new ArrayList<>();

    public void addExercise(WorkoutExercise workoutExercise) {
        exercises.add(workoutExercise);
        workoutExercise.setWorkout(this);
    }

    public void removeExercise(WorkoutExercise workoutExercise) {
        exercises.remove(workoutExercise);
        workoutExercise.setWorkout(null);
    }
}
