package com.dayflow.authservice.service.impl;

import com.dayflow.authservice.dto.LoginIdGenerationRequest;
import com.dayflow.authservice.service.CredentialGeneratorService;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Locale;

@Service
public class CredentialGeneratorServiceImpl implements CredentialGeneratorService {

    private static final String UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final String LOWER = "abcdefghijklmnopqrstuvwxyz";
    private static final String DIGITS = "0123456789";
    private static final String SPECIAL = "!@#$%^&*()-_=+";
    
    private static final SecureRandom RANDOM = new SecureRandom();
    
    @Override
    public String generateLoginId(LoginIdGenerationRequest request) {
        String companyCode = request.getCompanyCode() != null ? request.getCompanyCode().trim().toUpperCase(Locale.ROOT) : "";
        String firstNameCode = extractNamePart(request.getFirstName());
        String lastNameCode = extractNamePart(request.getLastName());
        String year = String.format("%04d", request.getJoiningYear());
        String serial = String.format("%04d", request.getSerialNumber());
        
        return companyCode + firstNameCode + lastNameCode + year + serial;
    }

    private String extractNamePart(String name) {
        if (name == null || name.trim().isEmpty()) {
            return "XX";
        }
        
        // Remove spaces, hyphens, and other non-alphabetic characters
        String normalized = name.replaceAll("[^a-zA-Z]", "").toUpperCase(Locale.ROOT);
        
        if (normalized.length() == 0) {
            return "XX";
        } else if (normalized.length() == 1) {
            return normalized + "X";
        } else {
            return normalized.substring(0, 2);
        }
    }

    @Override
    public String generateTemporaryPassword() {
        int length = 12;
        StringBuilder password = new StringBuilder(length);
        
        // Ensure at least one of each required type
        password.append(UPPER.charAt(RANDOM.nextInt(UPPER.length())));
        password.append(LOWER.charAt(RANDOM.nextInt(LOWER.length())));
        password.append(DIGITS.charAt(RANDOM.nextInt(DIGITS.length())));
        password.append(SPECIAL.charAt(RANDOM.nextInt(SPECIAL.length())));
        
        String allCharacters = UPPER + LOWER + DIGITS + SPECIAL;
        
        for (int i = 4; i < length; i++) {
            password.append(allCharacters.charAt(RANDOM.nextInt(allCharacters.length())));
        }
        
        // Shuffle the string to avoid predictable patterns
        char[] passwordChars = password.toString().toCharArray();
        for (int i = passwordChars.length - 1; i > 0; i--) {
            int index = RANDOM.nextInt(i + 1);
            char temp = passwordChars[index];
            passwordChars[index] = passwordChars[i];
            passwordChars[i] = temp;
        }
        
        return new String(passwordChars);
    }
}
