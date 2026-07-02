package com.fitness.backend.modules.nutrition.domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "meal_items")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MealItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meal_id", nullable = false)
    private Meal meal;

    @Column(name = "food_name", nullable = false)
    private String foodName;

    @Column(nullable = false)
    private Integer calories;

    @Column(name = "protein_g")
    private Double proteinG;

    @Column(name = "carbs_g")
    private Double carbsG;

    @Column(name = "fat_g")
    private Double fatG;

    @Column(name = "serving_size_g", nullable = false)
    private Double servingSizeG;

    @Column(name = "servings_count", nullable = false)
    private Double servingsCount;
}
