package com.dayflow.authservice.dto;

public class AccountCreationResponse {

    private String loginId;
    private String temporaryPassword;

    public AccountCreationResponse() {}

    public AccountCreationResponse(String loginId, String temporaryPassword) {
        this.loginId = loginId;
        this.temporaryPassword = temporaryPassword;
    }

    public String getLoginId() { return loginId; }
    public void setLoginId(String loginId) { this.loginId = loginId; }

    public String getTemporaryPassword() { return temporaryPassword; }
    public void setTemporaryPassword(String temporaryPassword) { this.temporaryPassword = temporaryPassword; }
}
