package com.fitness.backend.modules.workout.domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "exercises")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Exercise {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name; // e.g., "Barbell Bench Press"

    @Column(columnDefinition = "TEXT")
    private String description;

    private String muscleGroup; // e.g., "Chest"

    private String equipment;   // e.g., "Barbell"
    
    private String imageUrl;    // URL to a GIF/Image
    
    private Long externalId;    // ID from Wger API
}