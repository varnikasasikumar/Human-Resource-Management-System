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

    @Mock
    private com.dayflow.authservice.security.JwtTokenProvider jwtTokenProvider;

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

    @Test
    void testLogin_Success() {
        // Arrange
        com.dayflow.authservice.dto.LoginRequest request = new com.dayflow.authservice.dto.LoginRequest();
        request.setLoginId("OIJODO20230001");
        request.setPassword("Password123!");

        User user = new User();
        user.setLoginId("OIJODO20230001");
        user.setPasswordHash("$2a$10$hashed");
        user.setRole(Role.EMPLOYEE);
        user.setEnabled(true);
        user.setFirstLogin(true);

        when(userRepository.findByLoginId(request.getLoginId())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(request.getPassword(), user.getPasswordHash())).thenReturn(true);
        when(jwtTokenProvider.generateToken(user.getLoginId(), user.getRole().name())).thenReturn("jwt.token.here");

        // Act
        com.dayflow.authservice.dto.LoginResponse response = authService.login(request);

        // Assert
        assertNotNull(response);
        assertEquals("jwt.token.here", response.getToken());
        assertEquals("OIJODO20230001", response.getLoginId());
        assertEquals(Role.EMPLOYEE, response.getRole());
        assertTrue(response.isFirstLogin());
    }

    @Test
    void testLogin_InvalidLoginId() {
        // Arrange
        com.dayflow.authservice.dto.LoginRequest request = new com.dayflow.authservice.dto.LoginRequest();
        request.setLoginId("UNKNOWN");
        request.setPassword("Password123!");

        when(userRepository.findByLoginId(request.getLoginId())).thenReturn(Optional.empty());

        // Act & Assert
        com.dayflow.authservice.exception.InvalidCredentialsException exception = assertThrows(com.dayflow.authservice.exception.InvalidCredentialsException.class, () -> {
            authService.login(request);
        });
        assertEquals("Invalid Login ID or Password", exception.getMessage());
    }

    @Test
    void testLogin_InvalidPassword() {
        // Arrange
        com.dayflow.authservice.dto.LoginRequest request = new com.dayflow.authservice.dto.LoginRequest();
        request.setLoginId("OIJODO20230001");
        request.setPassword("WrongPassword!");

        User user = new User();
        user.setLoginId("OIJODO20230001");
        user.setPasswordHash("$2a$10$hashed");
        user.setEnabled(true);

        when(userRepository.findByLoginId(request.getLoginId())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(request.getPassword(), user.getPasswordHash())).thenReturn(false);

        // Act & Assert
        com.dayflow.authservice.exception.InvalidCredentialsException exception = assertThrows(com.dayflow.authservice.exception.InvalidCredentialsException.class, () -> {
            authService.login(request);
        });
        assertEquals("Invalid Login ID or Password", exception.getMessage());
    }

    @Test
    void testLogin_AccountDisabled() {
        // Arrange
        com.dayflow.authservice.dto.LoginRequest request = new com.dayflow.authservice.dto.LoginRequest();
        request.setLoginId("OIJODO20230001");
        request.setPassword("Password123!");

        User user = new User();
        user.setLoginId("OIJODO20230001");
        user.setPasswordHash("$2a$10$hashed");
        user.setEnabled(false); // Disabled

        when(userRepository.findByLoginId(request.getLoginId())).thenReturn(Optional.of(user));

        // Act & Assert
        com.dayflow.authservice.exception.AccountDisabledException exception = assertThrows(com.dayflow.authservice.exception.AccountDisabledException.class, () -> {
            authService.login(request);
        });
        assertEquals("Account is disabled. Please contact HR.", exception.getMessage());
    }
}
