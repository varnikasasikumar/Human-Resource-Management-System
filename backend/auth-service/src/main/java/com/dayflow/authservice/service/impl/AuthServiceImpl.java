package com.dayflow.authservice.service.impl;

import com.dayflow.authservice.dto.AccountCreationRequest;
import com.dayflow.authservice.dto.AccountCreationResponse;
import com.dayflow.authservice.dto.LoginIdGenerationRequest;
import com.dayflow.authservice.exception.DuplicateResourceException;
import com.dayflow.authservice.model.User;
import com.dayflow.authservice.repository.UserRepository;
import com.dayflow.authservice.service.AuthService;
import com.dayflow.authservice.service.CredentialGeneratorService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final CredentialGeneratorService credentialGeneratorService;
    private final PasswordEncoder passwordEncoder;

    public AuthServiceImpl(UserRepository userRepository, 
                           CredentialGeneratorService credentialGeneratorService, 
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.credentialGeneratorService = credentialGeneratorService;
        this.passwordEncoder = passwordEncoder;
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
}
