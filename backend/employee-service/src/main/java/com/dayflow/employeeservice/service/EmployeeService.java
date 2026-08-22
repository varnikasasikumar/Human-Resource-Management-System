package com.dayflow.employeeservice.service;

import com.dayflow.employeeservice.dto.EmployeeRequest;
import com.dayflow.employeeservice.dto.EmployeeResponse;

import java.util.List;

public interface EmployeeService {
    EmployeeResponse createEmployee(EmployeeRequest request);
    EmployeeResponse getEmployeeById(String id);
    List<EmployeeResponse> getAllEmployees();
    EmployeeResponse updateEmployee(String id, EmployeeRequest request);
    void deleteEmployee(String id);
}
