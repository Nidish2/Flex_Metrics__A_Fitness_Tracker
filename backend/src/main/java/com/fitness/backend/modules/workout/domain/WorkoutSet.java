package com.fitness.backend.modules.workout.domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "workout_sets")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutSet {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workout_exercise_id", nullable = false)
    private WorkoutExercise workoutExercise;

    @Column(name = "set_number", nullable = false)
    private Integer setNumber;

    @Column(name = "weight_kg")
    private Double weightKg;

    @Column(nullable = false)
    private Integer reps;

    @Builder.Default
    @Column(name = "completed")
    private Boolean completed = false;

    @Column(name = "rpe")
    private Integer rpe;
}
