package com.fitness.backend.modules.user.infra;

import com.fitness.backend.modules.user.domain.BodyMetric;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface BodyMetricRepository extends JpaRepository<BodyMetric, UUID> {
    List<BodyMetric> findByUserIdOrderByLoggedAtDesc(UUID userId);
    Page<BodyMetric> findByUserIdOrderByLoggedAtDesc(UUID userId, Pageable pageable);
}
