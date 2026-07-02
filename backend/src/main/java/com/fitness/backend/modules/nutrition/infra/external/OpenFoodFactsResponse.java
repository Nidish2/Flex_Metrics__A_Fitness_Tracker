package com.fitness.backend.modules.nutrition.infra.external;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class OpenFoodFactsResponse {
    private List<Product> products;

    @Data
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Product {
        private String code;
        @JsonProperty("product_name")
        private String productName;
        @JsonProperty("image_front_url")
        private String imageFrontUrl;
        @JsonProperty("serving_size")
        private String servingSize;
        private Nutriments nutriments;
    }

    @Data
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Nutriments {
        @JsonProperty("energy-kcal_100g")
        private Double energyKcal100g;
        @JsonProperty("proteins_100g")
        private Double proteins100g;
        @JsonProperty("carbohydrates_100g")
        private Double carbohydrates100g;
        @JsonProperty("fat_100g")
        private Double fat100g;
    }
}
