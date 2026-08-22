package com.dayflow.authservice.dto;

import com.dayflow.authservice.model.Role;

public class LoginResponse {

    private String token;
    private String loginId;
    private Role role;
    private boolean firstLogin;

    public LoginResponse() {}

    public LoginResponse(String token, String loginId, Role role, boolean firstLogin) {
        this.token = token;
        this.loginId = loginId;
        this.role = role;
        this.firstLogin = firstLogin;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getLoginId() { return loginId; }
    public void setLoginId(String loginId) { this.loginId = loginId; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public boolean isFirstLogin() { return firstLogin; }
    public void setFirstLogin(boolean firstLogin) { this.firstLogin = firstLogin; }
}
