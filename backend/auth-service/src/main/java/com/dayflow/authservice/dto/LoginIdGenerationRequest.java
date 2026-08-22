package com.dayflow.authservice.dto;

public class LoginIdGenerationRequest {
    
    private String companyCode;
    private String firstName;
    private String lastName;
    private int joiningYear;
    private int serialNumber;

    public LoginIdGenerationRequest() {}

    public LoginIdGenerationRequest(String companyCode, String firstName, String lastName, int joiningYear, int serialNumber) {
        this.companyCode = companyCode;
        this.firstName = firstName;
        this.lastName = lastName;
        this.joiningYear = joiningYear;
        this.serialNumber = serialNumber;
    }

    public String getCompanyCode() {
        return companyCode;
    }

    public void setCompanyCode(String companyCode) {
        this.companyCode = companyCode;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public int getJoiningYear() {
        return joiningYear;
    }

    public void setJoiningYear(int joiningYear) {
        this.joiningYear = joiningYear;
    }

    public int getSerialNumber() {
        return serialNumber;
    }

    public void setSerialNumber(int serialNumber) {
        this.serialNumber = serialNumber;
    }
}
