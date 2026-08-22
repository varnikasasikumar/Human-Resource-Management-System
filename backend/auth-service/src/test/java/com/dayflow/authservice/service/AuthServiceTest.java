package com.dayflow.authservice.service;

import com.dayflow.authservice.dto.AccountCreationRequest;
import com.dayflow.authservice.dto.AccountCreationResponse;
import com.dayflow.authservice.dto.LoginIdGenerationRequest;
import com.dayflow.authservice.exception.DuplicateResourceException;
import com.dayflow.authservice.model.Role;
import com.dayflow.authservice.model.User;
import com.dayflow.authservice.repository.UserRepository;
import com.dayflow.authservice.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CredentialGeneratorService credentialGeneratorService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthServiceImpl authService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCreateAccount_Success() {
        // Arrange
        AccountCreationRequest request = new AccountCreationRequest();
        request.setCompanyCode("OI");
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setEmail("john.doe@example.com");
        request.setJoiningYear(2023);
        request.setJoiningSerialNumber(1);
        request.setRole(Role.EMPLOYEE);

        String expectedLoginId = "OIJODO20230001";
        String expectedTempPwd = "TempPassword123!";
        String expectedHash = "$2a$10$hashedpassword";

        when(credentialGeneratorService.generateLoginId(any(LoginIdGenerationRequest.class)))
                .thenReturn(expectedLoginId);
        when(userRepository.findByLoginId(expectedLoginId)).thenReturn(Optional.empty());
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.empty());
        when(credentialGeneratorService.generateTemporaryPassword()).thenReturn(expectedTempPwd);
        when(passwordEncoder.encode(expectedTempPwd)).thenReturn(expectedHash);

        // Act
        AccountCreationResponse response = authService.createAccount(request);

        // Assert
        assertNotNull(response);
        assertEquals(expectedLoginId, response.getLoginId());
        assertEquals(expectedTempPwd, response.getTemporaryPassword());

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository, times(1)).save(userCaptor.capture());

        User savedUser = userCaptor.getValue();
        assertEquals(expectedLoginId, savedUser.getLoginId());
        assertEquals("john.doe@example.com", savedUser.getEmail());
        assertEquals(expectedHash, savedUser.getPasswordHash());
        assertNotEquals(expectedTempPwd, savedUser.getPasswordHash());
        assertTrue(savedUser.isFirstLogin());
        assertTrue(savedUser.isEnabled());
        assertEquals(Role.EMPLOYEE, savedUser.getRole());
    }

    @Test
    void testCreateAccount_DuplicateLoginId() {
        // Arrange
        AccountCreationRequest request = new AccountCreationRequest();
        request.setCompanyCode("OI");
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setEmail("john.doe@example.com");
        request.setJoiningYear(2023);
        request.setJoiningSerialNumber(1);

        String expectedLoginId = "OIJODO20230001";
        
        when(credentialGeneratorService.generateLoginId(any(LoginIdGenerationRequest.class)))
                .thenReturn(expectedLoginId);
        when(userRepository.findByLoginId(expectedLoginId)).thenReturn(Optional.of(new User()));

        // Act & Assert
        DuplicateResourceException exception = assertThrows(DuplicateResourceException.class, () -> {
            authService.createAccount(request);
        });
        
        assertTrue(exception.getMessage().contains("login ID"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testCreateAccount_DuplicateEmail() {
        // Arrange
        AccountCreationRequest request = new AccountCreationRequest();
        request.setCompanyCode("OI");
        request.setFirstName("Jane");
        request.setLastName("Doe");
        request.setEmail("jane.doe@example.com");
        request.setJoiningYear(2023);
        request.setJoiningSerialNumber(2);

        String expectedLoginId = "OIJADO20230002";
        
        when(credentialGeneratorService.generateLoginId(any(LoginIdGenerationRequest.class)))
                .thenReturn(expectedLoginId);
        when(userRepository.findByLoginId(expectedLoginId)).thenReturn(Optional.empty());
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(new User()));

        // Act & Assert
        DuplicateResourceException exception = assertThrows(DuplicateResourceException.class, () -> {
            authService.createAccount(request);
        });
        
        assertTrue(exception.getMessage().contains("email"));
        verify(userRepository, never()).save(any(User.class));
    }
}
