package com.fitness.backend.modules.nutrition.controller;

import com.fitness.backend.modules.nutrition.dto.FoodCatalogItemDto;
import com.fitness.backend.modules.nutrition.service.FoodCatalogService;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Validated
@RestController
@RequestMapping("/api/v1/foods")
@RequiredArgsConstructor
public class FoodCatalogController {

    private final FoodCatalogService foodCatalogService;

    @GetMapping("/search")
    public ResponseEntity<List<FoodCatalogItemDto>> searchFoods(
            @RequestParam @NotBlank String q,
            @RequestParam(defaultValue = "10") int pageSize
    ) {
        return ResponseEntity.ok(foodCatalogService.searchFoods(q.trim(), Math.min(Math.max(pageSize, 1), 50)));
    }
}
