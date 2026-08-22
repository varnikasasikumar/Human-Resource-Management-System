package com.dayflow.authservice.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;

    private final String secret = "9a4f14e1a04e578fa62e84128522784b2c018274d81a95a89467d32c91a329df02882798e4d2919fae39b927a7f45c81d2f1";
    private final long expiration = 86400000;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider(secret, expiration);
    }

    @Test
    void testGenerateAndValidateToken() {
        String token = jwtTokenProvider.generateToken("OIJODO20230001", "EMPLOYEE");
        
        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));
        
        assertEquals("OIJODO20230001", jwtTokenProvider.getLoginIdFromToken(token));
        assertEquals("EMPLOYEE", jwtTokenProvider.getRoleFromToken(token));
    }

    @Test
    void testInvalidToken() {
        assertFalse(jwtTokenProvider.validateToken("invalid.token.here"));
    }
}
