package com.fitness.backend.modules.user.service;

import com.fitness.backend.modules.auth.domain.User;
import com.fitness.backend.modules.user.domain.BodyMetric;
import com.fitness.backend.modules.user.domain.UserProfile;
import com.fitness.backend.modules.user.dto.BodyMetricDto;
import com.fitness.backend.modules.user.dto.UpdateProfileRequestDto;
import com.fitness.backend.modules.user.dto.UserProfileDto;
import com.fitness.backend.modules.user.infra.BodyMetricRepository;
import com.fitness.backend.modules.user.infra.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserProfileRepository profileRepository;
    private final BodyMetricRepository metricRepository;

    @Transactional
    public UserProfileDto getProfile(User user) {
        UserProfile profile = profileRepository.findByUserId(user.getId())
                .orElseGet(() -> profileRepository.save(UserProfile.builder().user(user).build()));
        return mapToProfileDto(profile);
    }

    @Transactional
    public UserProfileDto updateProfile(User user, UpdateProfileRequestDto dto) {
        UserProfile profile = profileRepository.findByUserId(user.getId())
                .orElseGet(() -> UserProfile.builder().user(user).build());

        profile.setHeightCm(dto.getHeightCm());
        profile.setBirthDate(dto.getBirthDate());
        profile.setBiologicalSex(dto.getBiologicalSex());
        profile.setActivityLevel(dto.getActivityLevel());
        profile.setDailyCalorieGoal(dto.getDailyCalorieGoal());
        profile.setDailyProteinGoal(dto.getDailyProteinGoal());
        profile.setDailyCarbsGoal(dto.getDailyCarbsGoal());
        profile.setDailyFatGoal(dto.getDailyFatGoal());

        UserProfile saved = profileRepository.save(profile);
        return mapToProfileDto(saved);
    }

    @Transactional
    public BodyMetricDto addMetric(User user, BodyMetricDto dto) {
        BodyMetric metric = BodyMetric.builder()
                .user(user)
                .weightKg(dto.getWeightKg())
                .bodyFatPercentage(dto.getBodyFatPercentage())
                .loggedAt(dto.getLoggedAt() != null ? dto.getLoggedAt() : LocalDateTime.now())
                .build();

        BodyMetric saved = metricRepository.save(metric);
        return mapToMetricDto(saved);
    }

    @Transactional(readOnly = true)
    public Page<BodyMetricDto> getMetrics(User user, Pageable pageable) {
        return metricRepository.findByUserIdOrderByLoggedAtDesc(user.getId(), pageable)
                .map(this::mapToMetricDto);
    }

    private UserProfileDto mapToProfileDto(UserProfile p) {
        return UserProfileDto.builder()
                .heightCm(p.getHeightCm())
                .birthDate(p.getBirthDate())
                .biologicalSex(p.getBiologicalSex())
                .activityLevel(p.getActivityLevel())
                .dailyCalorieGoal(p.getDailyCalorieGoal())
                .dailyProteinGoal(p.getDailyProteinGoal())
                .dailyCarbsGoal(p.getDailyCarbsGoal())
                .dailyFatGoal(p.getDailyFatGoal())
                .build();
    }

    private BodyMetricDto mapToMetricDto(BodyMetric m) {
        return BodyMetricDto.builder()
                .id(m.getId().toString())
                .weightKg(m.getWeightKg())
                .bodyFatPercentage(m.getBodyFatPercentage())
                .loggedAt(m.getLoggedAt())
                .build();
    }
}
