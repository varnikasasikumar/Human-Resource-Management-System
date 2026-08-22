package com.dayflow.authservice.service.impl;

import com.dayflow.authservice.dto.AccountCreationRequest;
import com.dayflow.authservice.dto.AccountCreationResponse;
import com.dayflow.authservice.dto.LoginIdGenerationRequest;
import com.dayflow.authservice.dto.LoginRequest;
import com.dayflow.authservice.dto.LoginResponse;
import com.dayflow.authservice.exception.AccountDisabledException;
import com.dayflow.authservice.exception.DuplicateResourceException;
import com.dayflow.authservice.exception.InvalidCredentialsException;
import com.dayflow.authservice.model.User;
import com.dayflow.authservice.repository.UserRepository;
import com.dayflow.authservice.security.JwtTokenProvider;
import com.dayflow.authservice.service.AuthService;
import com.dayflow.authservice.service.CredentialGeneratorService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final CredentialGeneratorService credentialGeneratorService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthServiceImpl(UserRepository userRepository, 
                           CredentialGeneratorService credentialGeneratorService, 
                           PasswordEncoder passwordEncoder,
                           JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.credentialGeneratorService = credentialGeneratorService;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    public AccountCreationResponse createAccount(AccountCreationRequest request) {
        // 1. Generate Login ID
        LoginIdGenerationRequest loginIdReq = new LoginIdGenerationRequest(
                request.getCompanyCode(),
                request.getFirstName(),
                request.getLastName(),
                request.getJoiningYear(),
                request.getJoiningSerialNumber()
        );
        String loginId = credentialGeneratorService.generateLoginId(loginIdReq);

        // 2. Validate Uniqueness
        if (userRepository.findByLoginId(loginId).isPresent()) {
            throw new DuplicateResourceException("An account with login ID " + loginId + " already exists.");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new DuplicateResourceException("An account with email " + request.getEmail() + " already exists.");
        }

        // 3. Generate Temporary Password
        String temporaryPassword = credentialGeneratorService.generateTemporaryPassword();
        String passwordHash = passwordEncoder.encode(temporaryPassword);

        // 4. Create User
        User user = new User();
        user.setLoginId(loginId);
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordHash); // Store ONLY hash
        user.setRole(request.getRole());
        user.setFirstLogin(true);
        user.setEnabled(true);

        // 5. Save User
        userRepository.save(user);

        // 6. Return Credentials (plaintext password returned to caller, not stored)
        return new AccountCreationResponse(loginId, temporaryPassword);
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        // 1. Find user by loginId
        User user = userRepository.findByLoginId(request.getLoginId())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid Login ID or Password"));

        // 2. Check if user is enabled
        if (!user.isEnabled()) {
            throw new AccountDisabledException("Account is disabled. Please contact HR.");
        }

        // 3. Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid Login ID or Password");
        }

        // 4. Generate JWT token
        String token = jwtTokenProvider.generateToken(user.getLoginId(), user.getRole().name());

        // 5. Return LoginResponse
        return new LoginResponse(token, user.getLoginId(), user.getRole(), user.isFirstLogin());
    }
}
