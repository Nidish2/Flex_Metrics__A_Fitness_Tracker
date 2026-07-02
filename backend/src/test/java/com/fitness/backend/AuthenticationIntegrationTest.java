package com.fitness.backend;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fitness.backend.modules.auth.infra.UserRepository;
import com.fitness.backend.modules.nutrition.infra.MealItemRepository;
import com.fitness.backend.modules.nutrition.infra.MealRepository;
import com.fitness.backend.modules.user.infra.BodyMetricRepository;
import com.fitness.backend.modules.user.infra.UserProfileRepository;
import com.fitness.backend.modules.workout.domain.Exercise;
import com.fitness.backend.modules.workout.infra.ExerciseRepository;
import com.fitness.backend.modules.workout.infra.WorkoutExerciseRepository;
import com.fitness.backend.modules.workout.infra.WorkoutRepository;
import com.fitness.backend.modules.workout.infra.WorkoutSetRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthenticationIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UserRepository userRepository;
    @Autowired private UserProfileRepository userProfileRepository;
    @Autowired private BodyMetricRepository bodyMetricRepository;
    @Autowired private ExerciseRepository exerciseRepository;
    @Autowired private WorkoutRepository workoutRepository;
    @Autowired private WorkoutExerciseRepository workoutExerciseRepository;
    @Autowired private WorkoutSetRepository workoutSetRepository;
    @Autowired private MealRepository mealRepository;
    @Autowired private MealItemRepository mealItemRepository;

    @BeforeEach
    void cleanDatabase() {
        mealItemRepository.deleteAll();
        mealRepository.deleteAll();
        workoutSetRepository.deleteAll();
        workoutExerciseRepository.deleteAll();
        workoutRepository.deleteAll();
        bodyMetricRepository.deleteAll();
        userProfileRepository.deleteAll();
        exerciseRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void registerWithInvalidEmail_shouldReturnBadRequest() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"firstName":"John","lastName":"Doe","email":"invalid-email","password":"12345"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Failed"))
                .andExpect(jsonPath("$.details.email").exists())
                .andExpect(jsonPath("$.details.password").value("Password must be at least 6 characters"));
    }

    @Test
    void loginWithInvalidCredentials_shouldReturnUnauthorized() throws Exception {
        mockMvc.perform(post("/api/v1/auth/authenticate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"nonexistent@fitness.com","password":"wrongpassword"}
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Authentication Failed"));
    }

    @Test
    void accessSecuredEndpointWithoutToken_shouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/profile"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    void adminSeedShouldBeForbiddenForNormalUser() throws Exception {
        String token = registerAndGetToken("user1@fitness.com");

        mockMvc.perform(post("/api/v1/admin/seed-exercises")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Forbidden"));
    }

    @Test
    void profileWorkoutAndMealFlowsShouldWorkEndToEnd() throws Exception {
        String token = registerAndGetToken("athlete@fitness.com");

        mockMvc.perform(put("/api/v1/profile")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "heightCm": 178.5,
                                  "birthDate": "1999-06-15",
                                  "biologicalSex": "male",
                                  "activityLevel": "moderate",
                                  "dailyCalorieGoal": 2400,
                                  "dailyProteinGoal": 160,
                                  "dailyCarbsGoal": 250,
                                  "dailyFatGoal": 70
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dailyCalorieGoal").value(2400));

        mockMvc.perform(post("/api/v1/profile/metrics")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"weightKg":82.4,"bodyFatPercentage":14.8}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.weightKg").value(82.4));

        Exercise exercise = exerciseRepository.save(Exercise.builder()
                .name("Barbell Bench Press")
                .description("Press the barbell from chest")
                .muscleGroup("Chest")
                .equipment("Barbell")
                .imageUrl("https://example.com/bench.gif")
                .externalId(10001L)
                .build());

        String workoutResponse = mockMvc.perform(post("/api/v1/workouts")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"note\":\"Push day\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode workoutJson = objectMapper.readTree(workoutResponse);
        UUID workoutId = UUID.fromString(workoutJson.get("id").asText());

        String workoutExerciseResponse = mockMvc.perform(post("/api/v1/workouts/" + workoutId + "/exercises")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"exerciseId\":\"" + exercise.getId() + "\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.exerciseName").value("Barbell Bench Press"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode workoutExerciseJson = objectMapper.readTree(workoutExerciseResponse);
        UUID workoutExerciseId = UUID.fromString(workoutExerciseJson.get("id").asText());

        mockMvc.perform(post("/api/v1/workouts/exercises/" + workoutExerciseId + "/sets")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"setNumber":1,"weightKg":100.0,"reps":8,"rpe":8}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.reps").value(8));

        mockMvc.perform(get("/api/v1/workouts/" + workoutId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exercises[0].exerciseName").value("Barbell Bench Press"))
                .andExpect(jsonPath("$.exercises[0].sets[0].reps").value(8));

        mockMvc.perform(post("/api/v1/meals")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name":"Breakfast",
                                  "items":[
                                    {
                                      "foodName":"Oats",
                                      "calories":300,
                                      "proteinG":10.0,
                                      "carbsG":54.0,
                                      "fatG":5.0,
                                      "servingSizeG":100.0,
                                      "servingsCount":1.0
                                    }
                                  ]
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.items[0].foodName").value("Oats"));

        mockMvc.perform(get("/api/v1/meals/summary")
                        .header("Authorization", "Bearer " + token)
                        .param("date", LocalDate.now().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCalories").value(300));
    }

    private String registerAndGetToken(String email) throws Exception {
        String response = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "firstName":"Test",
                                  "lastName":"User",
                                  "email":"%s",
                                  "password":"password123"
                                }
                                """.formatted(email)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").exists())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode jsonNode = objectMapper.readTree(response);
        return jsonNode.get("token").asText();
    }
}
