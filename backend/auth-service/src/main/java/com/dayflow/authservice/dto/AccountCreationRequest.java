package com.dayflow.authservice.dto;

import com.dayflow.authservice.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class AccountCreationRequest {

    @NotBlank(message = "Company code is required")
    private String companyCode;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotNull(message = "Joining year is required")
    @Positive(message = "Joining year must be positive")
    private Integer joiningYear;

    @NotNull(message = "Joining serial number is required")
    @Positive(message = "Joining serial number must be positive")
    private Integer joiningSerialNumber;

    @NotNull(message = "Role is required")
    private Role role;

    public AccountCreationRequest() {}

    public String getCompanyCode() { return companyCode; }
    public void setCompanyCode(String companyCode) { this.companyCode = companyCode; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Integer getJoiningYear() { return joiningYear; }
    public void setJoiningYear(Integer joiningYear) { this.joiningYear = joiningYear; }

    public Integer getJoiningSerialNumber() { return joiningSerialNumber; }
    public void setJoiningSerialNumber(Integer joiningSerialNumber) { this.joiningSerialNumber = joiningSerialNumber; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
}
