package com.fitness.backend.modules.user.domain;

import com.fitness.backend.modules.auth.domain.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "user_profiles")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "height_cm")
    private Double heightCm;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(name = "biological_sex")
    private String biologicalSex;

    @Column(name = "activity_level")
    private String activityLevel;

    @Column(name = "daily_calorie_goal")
    private Integer dailyCalorieGoal;

    @Column(name = "daily_protein_goal")
    private Integer dailyProteinGoal;

    @Column(name = "daily_carbs_goal")
    private Integer dailyCarbsGoal;

    @Column(name = "daily_fat_goal")
    private Integer dailyFatGoal;
}
