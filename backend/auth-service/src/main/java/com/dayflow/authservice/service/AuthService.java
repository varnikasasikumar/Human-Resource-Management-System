package com.dayflow.authservice.service;

import com.dayflow.authservice.dto.AccountCreationRequest;
import com.dayflow.authservice.dto.AccountCreationResponse;

public interface AuthService {
    
    /**
     * Creates an authentication account for a newly provisioned employee.
     * @param request the details required for account creation
     * @return the generated Login ID and temporary password
     */
    AccountCreationResponse createAccount(AccountCreationRequest request);
}
