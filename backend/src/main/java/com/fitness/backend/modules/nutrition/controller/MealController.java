package com.fitness.backend.modules.nutrition.controller;

import com.fitness.backend.modules.auth.domain.User;
import com.fitness.backend.modules.nutrition.dto.DailyNutritionSummaryDto;
import com.fitness.backend.modules.nutrition.dto.MealDto;
import com.fitness.backend.modules.nutrition.service.MealService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/meals")
@RequiredArgsConstructor
public class MealController {

    private final MealService mealService;

    @PostMapping
    public ResponseEntity<MealDto> logMeal(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody MealDto dto
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(mealService.logMeal(user, dto));
    }

    @GetMapping
    public ResponseEntity<Page<MealDto>> getMeals(
            @AuthenticationPrincipal User user,
            @PageableDefault(size = 20) Pageable pageable,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        LocalDate targetDate = (date != null) ? date : LocalDate.now();
        return ResponseEntity.ok(mealService.getMealsForDate(user, targetDate, pageable));
    }

    @GetMapping("/summary")
    public ResponseEntity<DailyNutritionSummaryDto> getDailySummary(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        LocalDate targetDate = (date != null) ? date : LocalDate.now();
        return ResponseEntity.ok(mealService.getDailySummary(user, targetDate));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMeal(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id
    ) {
        mealService.deleteMeal(user, id);
        return ResponseEntity.noContent().build();
    }
}
