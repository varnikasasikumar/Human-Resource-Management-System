package com.dayflow.authservice.service;

import com.dayflow.authservice.dto.LoginIdGenerationRequest;

public interface CredentialGeneratorService {
    
    /**
     * Generates a Login ID based on company code, employee name, joining year, and serial number.
     * @param request the input data for Login ID generation
     * @return the generated Login ID
     */
    String generateLoginId(LoginIdGenerationRequest request);
    
    /**
     * Generates a secure temporary password.
     * @return the generated temporary password
     */
    String generateTemporaryPassword();
}
