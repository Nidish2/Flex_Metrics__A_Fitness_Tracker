package com.fitness.backend.modules.auth.service;

import com.fitness.backend.common.ResourceNotFoundException;
import com.fitness.backend.common.ResourceConflictException;
import com.fitness.backend.config.JwtService;
import com.fitness.backend.modules.auth.domain.Role;
import com.fitness.backend.modules.auth.domain.User;
import com.fitness.backend.modules.auth.dto.AuthenticationRequest;
import com.fitness.backend.modules.auth.dto.AuthenticationResponse;
import com.fitness.backend.modules.auth.dto.RegisterRequest;
import com.fitness.backend.modules.auth.infra.UserRepository;
import com.fitness.backend.modules.user.domain.UserProfile;
import com.fitness.backend.modules.user.infra.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository repository;
    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthenticationResponse register(RegisterRequest request) {
        if (repository.findByEmail(request.getEmail()).isPresent()) {
            throw new ResourceConflictException("User with this email already exists.");
        }

        // Build User Entity from Request
        var user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .build();
        
        repository.save(user); // Save to DB
        userProfileRepository.save(UserProfile.builder().user(user).build());
        
        var jwtToken = jwtService.generateToken(user); // Create Token
        return AuthenticationResponse.builder().token(jwtToken).build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        // This will throw exception if auth fails
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        
        // If we get here, user is valid
        var user = repository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        var jwtToken = jwtService.generateToken(user);
        
        return AuthenticationResponse.builder().token(jwtToken).build();
    }
}
