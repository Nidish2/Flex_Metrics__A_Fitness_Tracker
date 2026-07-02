package com.fitness.backend.modules.user.controller;

import com.fitness.backend.modules.auth.domain.User;
import com.fitness.backend.modules.user.dto.BodyMetricDto;
import com.fitness.backend.modules.user.dto.UpdateProfileRequestDto;
import com.fitness.backend.modules.user.dto.UserProfileDto;
import com.fitness.backend.modules.user.service.UserProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService profileService;

    @GetMapping
    public ResponseEntity<UserProfileDto> getProfile(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(profileService.getProfile(user));
    }

    @PutMapping
    public ResponseEntity<UserProfileDto> updateProfile(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UpdateProfileRequestDto dto
    ) {
        return ResponseEntity.ok(profileService.updateProfile(user, dto));
    }

    @PostMapping("/metrics")
    public ResponseEntity<BodyMetricDto> addMetric(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody BodyMetricDto dto
    ) {
        return ResponseEntity.ok(profileService.addMetric(user, dto));
    }

    @GetMapping("/metrics")
    public ResponseEntity<Page<BodyMetricDto>> getMetrics(
            @AuthenticationPrincipal User user,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(profileService.getMetrics(user, pageable));
    }
}
