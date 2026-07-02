package com.fitness.backend.modules.workout.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fitness.backend.common.ExternalServiceUnavailableException;
import com.fitness.backend.modules.workout.domain.Exercise;
import com.fitness.backend.modules.workout.infra.ExerciseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExerciseSeederService {

    private final ExerciseRepository exerciseRepository;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public int seedExercises() {
        String url = "https://wger.de/api/v2/exerciseinfo/?language=2&limit=50";
        log.info("Fetching raw data from: {}", url);
        
        try {
            // 1. Fetch RAW JSON String with transient failure retry loop
            String rawJson = null;
            int maxAttempts = 3;
            int attempt = 0;
            while (attempt < maxAttempts) {
                try {
                    attempt++;
                    rawJson = restClient.get()
                            .uri(url)
                            .header("User-Agent", "FitnessTracker/1.0") // Be polite to the API
                            .retrieve()
                            .body(String.class);
                    break;
                } catch (Exception e) {
                    log.warn("External API fetch attempt {}/{} failed: {}. Retrying in 1s...", attempt, maxAttempts, e.getMessage());
                    if (attempt >= maxAttempts) {
                        throw e; // Fail on final attempt
                    }
                    try {
                        Thread.sleep(1000);
                    } catch (InterruptedException interruptedException) {
                        Thread.currentThread().interrupt();
                        throw interruptedException;
                    }
                }
            }

            if (rawJson == null || rawJson.isBlank()) {
                log.error("Received empty or null response from the exercise API");
                return 0;
            }

            log.info("Received JSON (First 100 chars): {}", rawJson.substring(0, Math.min(rawJson.length(), 100)));

            // 2. Parse Manually
            JsonNode root = objectMapper.readTree(rawJson);
            JsonNode results = root.get("results");

            if (results == null || !results.isArray()) {
                log.error("JSON does not contain a 'results' array!");
                return 0;
            }

            int count = 0;
            for (JsonNode node : results) {
                try {
                    // 3. Extract Fields Manually (Safest method)
                    String name = node.has("name") ? node.get("name").asText() : null;
                    String desc = node.has("description") ? node.get("description").asText() : "";
                    Long externalId = node.has("id") ? node.get("id").asLong() : null;
                    
                    // --- Validation ---
                    if (name == null || name.trim().isEmpty() || externalId == null) {
                        continue;
                    }
                    
                    if (exerciseRepository.existsByExternalId(externalId) || 
                        exerciseRepository.findByName(name).isPresent()) {
                        continue; // Skip duplicates
                    }

                    // 4. Save
                    Exercise exercise = Exercise.builder()
                            .name(name)
                            .description(cleanHtml(desc))
                            .externalId(externalId)
                            .muscleGroup("General")
                            .equipment("Unknown")
                            .build();

                    exerciseRepository.save(exercise);
                    count++;
                    
                } catch (Exception e) {
                    log.error("Failed to save single exercise: {}", e.getMessage());
                }
            }
            
            log.info("Seeding complete. Saved {} new exercises.", count);
            return count;
            
        } catch (Exception e) {
            log.error("Fatal Seeding Error", e);
            throw new ExternalServiceUnavailableException("Exercise catalog import is temporarily unavailable.");
        }
    }

    private String cleanHtml(String input) {
        if (input == null || input.equals("null")) return "";
        String cleaned = input.replaceAll("\\<.*?\\>", ""); 
        return cleaned.length() > 250 ? cleaned.substring(0, 250) + "..." : cleaned;
    }
}
