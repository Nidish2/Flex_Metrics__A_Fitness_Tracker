package com.fitness.backend.modules.nutrition.service;

import com.fitness.backend.common.ResourceNotFoundException;
import com.fitness.backend.modules.auth.domain.User;
import com.fitness.backend.modules.nutrition.domain.Meal;
import com.fitness.backend.modules.nutrition.domain.MealItem;
import com.fitness.backend.modules.nutrition.dto.DailyNutritionSummaryDto;
import com.fitness.backend.modules.nutrition.dto.MealDto;
import com.fitness.backend.modules.nutrition.dto.MealItemDto;
import com.fitness.backend.modules.nutrition.infra.MealRepository;
import com.fitness.backend.modules.user.domain.UserProfile;
import com.fitness.backend.modules.user.infra.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MealService {

    private final MealRepository mealRepository;
    private final UserProfileRepository profileRepository;

    @Transactional
    public MealDto logMeal(User user, MealDto dto) {
        Meal meal = Meal.builder()
                .user(user)
                .name(dto.getName())
                .loggedAt(dto.getLoggedAt() != null ? dto.getLoggedAt() : LocalDateTime.now())
                .build();

        List<MealItem> items = dto.getItems().stream()
                .map(itemDto -> MealItem.builder()
                        .foodName(itemDto.getFoodName())
                        .calories(itemDto.getCalories())
                        .proteinG(itemDto.getProteinG() != null ? itemDto.getProteinG() : 0.0)
                        .carbsG(itemDto.getCarbsG() != null ? itemDto.getCarbsG() : 0.0)
                        .fatG(itemDto.getFatG() != null ? itemDto.getFatG() : 0.0)
                        .servingSizeG(itemDto.getServingSizeG())
                        .servingsCount(itemDto.getServingsCount())
                        .build())
                .collect(Collectors.toList());

        items.forEach(meal::addItem);
        Meal saved = mealRepository.save(meal);
        return mapToMealDto(saved);
    }

    @Transactional(readOnly = true)
    public List<MealDto> getMealsForDate(User user, LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(LocalTime.MAX);
        return mealRepository.findByUserIdAndLoggedAtBetweenOrderByLoggedAtDesc(user.getId(), start, end).stream()
                .map(this::mapToMealDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<MealDto> getMealsForDate(User user, LocalDate date, Pageable pageable) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(LocalTime.MAX);
        return mealRepository.findByUserIdAndLoggedAtBetweenOrderByLoggedAtDesc(user.getId(), start, end, pageable)
                .map(this::mapToMealDto);
    }

    @Transactional(readOnly = true)
    public DailyNutritionSummaryDto getDailySummary(User user, LocalDate date) {
        List<MealDto> dayMeals = getMealsForDate(user, date);

        int totalCalories = 0;
        double totalProtein = 0.0;
        double totalCarbs = 0.0;
        double totalFat = 0.0;

        for (MealDto meal : dayMeals) {
            for (MealItemDto item : meal.getItems()) {
                double scale = item.getServingsCount();
                totalCalories += (int) (item.getCalories() * scale);
                totalProtein += (item.getProteinG() != null ? item.getProteinG() : 0.0) * scale;
                totalCarbs += (item.getCarbsG() != null ? item.getCarbsG() : 0.0) * scale;
                totalFat += (item.getFatG() != null ? item.getFatG() : 0.0) * scale;
            }
        }

        UserProfile profile = profileRepository.findByUserId(user.getId()).orElse(null);

        return DailyNutritionSummaryDto.builder()
                .totalCalories(totalCalories)
                .totalProtein(totalProtein)
                .totalCarbs(totalCarbs)
                .totalFat(totalFat)
                .calorieGoal(profile != null ? profile.getDailyCalorieGoal() : null)
                .proteinGoal(profile != null ? profile.getDailyProteinGoal() : null)
                .carbsGoal(profile != null ? profile.getDailyCarbsGoal() : null)
                .fatGoal(profile != null ? profile.getDailyFatGoal() : null)
                .build();
    }

    @Transactional
    public void deleteMeal(User user, UUID mealId) {
        Meal meal = mealRepository.findById(mealId)
                .orElseThrow(() -> new ResourceNotFoundException("Meal log not found"));

        if (!meal.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Access denied: You do not own this meal log");
        }
        mealRepository.delete(meal);
    }

    private MealDto mapToMealDto(Meal m) {
        List<MealItemDto> items = m.getItems().stream()
                .map(i -> MealItemDto.builder()
                        .id(i.getId())
                        .foodName(i.getFoodName())
                        .calories(i.getCalories())
                        .proteinG(i.getProteinG())
                        .carbsG(i.getCarbsG())
                        .fatG(i.getFatG())
                        .servingSizeG(i.getServingSizeG())
                        .servingsCount(i.getServingsCount())
                        .build())
                .collect(Collectors.toList());

        return MealDto.builder()
                .id(m.getId())
                .name(m.getName())
                .loggedAt(m.getLoggedAt())
                .items(items)
                .build();
    }
}
