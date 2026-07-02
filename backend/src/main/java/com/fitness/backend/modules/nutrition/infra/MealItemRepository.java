package com.fitness.backend.modules.nutrition.infra;

import com.fitness.backend.modules.nutrition.domain.MealItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface MealItemRepository extends JpaRepository<MealItem, UUID> {
}
