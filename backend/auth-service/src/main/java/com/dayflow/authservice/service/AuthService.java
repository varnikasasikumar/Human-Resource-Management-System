package com.dayflow.authservice.service;

import com.dayflow.authservice.dto.AccountCreationRequest;
import com.dayflow.authservice.dto.AccountCreationResponse;
import com.dayflow.authservice.dto.LoginRequest;
import com.dayflow.authservice.dto.LoginResponse;

public interface AuthService {
    
    /**
     * Creates an authentication account for a newly provisioned employee.
     * @param request the details required for account creation
     * @return the generated Login ID and temporary password
     */
    AccountCreationResponse createAccount(AccountCreationRequest request);
    /**
     * Authenticates a user and generates a JWT.
     * @param request the login credentials
     * @return the generated JWT and basic user info
     */
    LoginResponse login(LoginRequest request);
}
