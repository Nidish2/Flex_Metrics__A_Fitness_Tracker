package com.fitness.backend.common;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class SimpleRateLimitFilter extends OncePerRequestFilter {

    private static final class Bucket {
        private volatile long windowStart;
        private final AtomicInteger count = new AtomicInteger(0);
    }

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${application.security.rate-limit.window-ms:60000}")
    private long windowMs;

    @Value("${application.security.rate-limit.max-requests:30}")
    private int maxRequests;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return !(path.startsWith("/api/v1/auth/") || path.startsWith("/api/v1/foods/") || path.startsWith("/api/v1/admin/"));
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String key = request.getRemoteAddr() + ":" + request.getRequestURI();
        long now = Instant.now().toEpochMilli();
        Bucket bucket = buckets.computeIfAbsent(key, ignored -> {
            Bucket created = new Bucket();
            created.windowStart = now;
            return created;
        });

        synchronized (bucket) {
            if (now - bucket.windowStart >= windowMs) {
                bucket.windowStart = now;
                bucket.count.set(0);
            }

            int next = bucket.count.incrementAndGet();
            if (next > maxRequests) {
                response.setStatus(429);
                response.setContentType("application/json");
                response.getWriter().write(objectMapper.writeValueAsString(Map.of(
                        "error", "Too Many Requests",
                        "message", "Too many requests. Please try again later."
                )));
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
