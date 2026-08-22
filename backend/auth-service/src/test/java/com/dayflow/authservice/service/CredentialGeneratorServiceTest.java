package com.dayflow.authservice.service;

import com.dayflow.authservice.dto.LoginIdGenerationRequest;
import com.dayflow.authservice.service.impl.CredentialGeneratorServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

public class CredentialGeneratorServiceTest {

    private CredentialGeneratorService credentialGeneratorService;

    @BeforeEach
    void setUp() {
        credentialGeneratorService = new CredentialGeneratorServiceImpl();
    }

    @Test
    void testGenerateLoginId_NormalNames() {
        LoginIdGenerationRequest request = new LoginIdGenerationRequest("OI", "John", "Doe", 2023, 1);
        String loginId = credentialGeneratorService.generateLoginId(request);
        assertEquals("OIJODO20230001", loginId);
    }

    @Test
    void testGenerateLoginId_NamesWithSpacesAndHyphens() {
        LoginIdGenerationRequest request = new LoginIdGenerationRequest("AB", "Mary-Jane", "De La Cruz", 2024, 42);
        String loginId = credentialGeneratorService.generateLoginId(request);
        
        // Mary-Jane -> MA
        // De La Cruz -> DE
        // Year: 2024, Serial: 0042
        assertEquals("ABMADE20240042", loginId);
    }

    @Test
    void testGenerateLoginId_ShortNames() {
        LoginIdGenerationRequest request = new LoginIdGenerationRequest("XY", "A", "Li", 2022, 9999);
        String loginId = credentialGeneratorService.generateLoginId(request);
        
        // A -> AX
        // Li -> LI
        assertEquals("XYAXLI20229999", loginId);
    }

    @Test
    void testGenerateLoginId_EmptyNames() {
        LoginIdGenerationRequest request = new LoginIdGenerationRequest("OI", "", null, 2021, 5);
        String loginId = credentialGeneratorService.generateLoginId(request);
        
        // "" -> XX
        // null -> XX
        assertEquals("OIXXXX20210005", loginId);
    }

    @Test
    void testGenerateTemporaryPassword_Format() {
        String password = credentialGeneratorService.generateTemporaryPassword();
        
        assertNotNull(password);
        assertEquals(12, password.length());
        
        boolean hasUpper = false;
        boolean hasLower = false;
        boolean hasDigit = false;
        boolean hasSpecial = false;
        
        for (char c : password.toCharArray()) {
            if (Character.isUpperCase(c)) hasUpper = true;
            else if (Character.isLowerCase(c)) hasLower = true;
            else if (Character.isDigit(c)) hasDigit = true;
            else hasSpecial = true;
        }
        
        assertTrue(hasUpper, "Password should contain uppercase");
        assertTrue(hasLower, "Password should contain lowercase");
        assertTrue(hasDigit, "Password should contain digit");
        assertTrue(hasSpecial, "Password should contain special character");
    }

    @Test
    void testGenerateTemporaryPassword_Uniqueness() {
        Set<String> passwords = new HashSet<>();
        for (int i = 0; i < 1000; i++) {
            String pwd = credentialGeneratorService.generateTemporaryPassword();
            assertTrue(passwords.add(pwd), "Generated passwords should be unique");
        }
    }
}
