package com.dayflow.authservice.controller;

import com.dayflow.authservice.dto.AccountCreationRequest;
import com.dayflow.authservice.dto.AccountCreationResponse;
import com.dayflow.authservice.dto.LoginRequest;
import com.dayflow.authservice.dto.LoginResponse;
import com.dayflow.authservice.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    private final AuthService authService;
    
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/accounts")
    public ResponseEntity<AccountCreationResponse> createAccount(@Valid @RequestBody AccountCreationRequest request) {
        AccountCreationResponse response = authService.createAccount(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody com.dayflow.authservice.dto.LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}
