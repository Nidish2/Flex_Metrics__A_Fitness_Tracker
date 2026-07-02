package com.fitness.backend.modules.nutrition.service;

import com.fitness.backend.modules.nutrition.dto.FoodCatalogItemDto;
import com.fitness.backend.modules.nutrition.infra.external.OpenFoodFactsResponse;
import com.fitness.backend.common.ExternalServiceUnavailableException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class FoodCatalogService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    @Cacheable(cacheNames = "foodSearch", key = "#query.toLowerCase() + ':' + #pageSize")
    public List<FoodCatalogItemDto> searchFoods(String query, int pageSize) {
        try {
            String rawJson = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .scheme("https")
                            .host("world.openfoodfacts.org")
                            .path("/cgi/search.pl")
                            .queryParam("search_terms", query)
                            .queryParam("search_simple", 1)
                            .queryParam("action", "process")
                            .queryParam("json", 1)
                            .queryParam("page_size", pageSize)
                            .build())
                    .retrieve()
                    .body(String.class);

            if (rawJson == null || rawJson.isBlank()) {
                return Collections.emptyList();
            }

            OpenFoodFactsResponse response = objectMapper.readValue(rawJson, OpenFoodFactsResponse.class);
            if (response.getProducts() == null) {
                return Collections.emptyList();
            }

            return response.getProducts().stream()
                    .map(product -> FoodCatalogItemDto.builder()
                            .code(product.getCode())
                            .name(product.getProductName())
                            .caloriesPer100g(product.getNutriments() != null ? product.getNutriments().getEnergyKcal100g() : null)
                            .proteinPer100g(product.getNutriments() != null ? product.getNutriments().getProteins100g() : null)
                            .carbsPer100g(product.getNutriments() != null ? product.getNutriments().getCarbohydrates100g() : null)
                            .fatPer100g(product.getNutriments() != null ? product.getNutriments().getFat100g() : null)
                            .servingSize(product.getServingSize())
                            .imageUrl(product.getImageFrontUrl())
                            .build())
                    .toList();
        } catch (Exception e) {
            log.warn("OpenFoodFacts search failed for query '{}': {}", query, e.getMessage());
            throw new ExternalServiceUnavailableException("Food search is temporarily unavailable. Please try again later.");
        }
    }
}
