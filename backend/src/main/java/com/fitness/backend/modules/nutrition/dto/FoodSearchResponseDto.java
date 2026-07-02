package com.fitness.backend.modules.nutrition.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoodSearchResponseDto {
    private String query;
    private List<FoodCatalogItemDto> items;
}
