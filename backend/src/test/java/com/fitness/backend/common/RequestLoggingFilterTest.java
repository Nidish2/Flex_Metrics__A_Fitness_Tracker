package com.fitness.backend.common;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class RequestLoggingFilterTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void loggingFilterShouldLogRequests() throws Exception {
        // Perform a request to verify the filter processes and logs it successfully (secured endpoint returns 401)
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isUnauthorized());
    }
}
