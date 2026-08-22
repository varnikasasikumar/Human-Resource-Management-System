package com.dayflow.employeeservice.service;

import com.dayflow.employeeservice.dto.EmployeeRequest;
import com.dayflow.employeeservice.dto.EmployeeResponse;
import com.dayflow.employeeservice.exception.DuplicateResourceException;
import com.dayflow.employeeservice.exception.ResourceNotFoundException;
import com.dayflow.employeeservice.model.Employee;
import com.dayflow.employeeservice.repository.EmployeeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceImplTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private EmployeeServiceImpl employeeService;

    private Employee sampleEmployee;
    private EmployeeRequest sampleRequest;

    @BeforeEach
    void setUp() {
        sampleEmployee = Employee.builder()
                .id("1001")
                .employeeId("EMP001")
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@dayflow.com")
                .phone("1234567890")
                .department("Engineering")
                .designation("Software Engineer")
                .salary(75000.0)
                .dateOfJoining(LocalDate.of(2024, 1, 15))
                .status("ACTIVE")
                .build();

        sampleRequest = EmployeeRequest.builder()
                .employeeId("EMP001")
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@dayflow.com")
                .phone("1234567890")
                .department("Engineering")
                .designation("Software Engineer")
                .salary(75000.0)
                .dateOfJoining(LocalDate.of(2024, 1, 15))
                .status("ACTIVE")
                .build();
    }

    @Test
    void createEmployee_Success() {
        when(employeeRepository.existsByEmployeeId(sampleRequest.getEmployeeId())).thenReturn(false);
        when(employeeRepository.existsByEmail(sampleRequest.getEmail())).thenReturn(false);
        when(employeeRepository.save(any(Employee.class))).thenReturn(sampleEmployee);

        EmployeeResponse response = employeeService.createEmployee(sampleRequest);

        assertNotNull(response);
        assertEquals("1001", response.getId());
        assertEquals("EMP001", response.getEmployeeId());
        assertEquals("john.doe@dayflow.com", response.getEmail());
        verify(employeeRepository, times(1)).save(any(Employee.class));
    }

    @Test
    void createEmployee_DuplicateEmployeeId_ThrowsException() {
        when(employeeRepository.existsByEmployeeId(sampleRequest.getEmployeeId())).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> employeeService.createEmployee(sampleRequest));
        verify(employeeRepository, never()).save(any(Employee.class));
    }

    @Test
    void createEmployee_DuplicateEmail_ThrowsException() {
        when(employeeRepository.existsByEmployeeId(sampleRequest.getEmployeeId())).thenReturn(false);
        when(employeeRepository.existsByEmail(sampleRequest.getEmail())).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> employeeService.createEmployee(sampleRequest));
        verify(employeeRepository, never()).save(any(Employee.class));
    }

    @Test
    void getEmployeeById_Success() {
        when(employeeRepository.findById("1001")).thenReturn(Optional.of(sampleEmployee));

        EmployeeResponse response = employeeService.getEmployeeById("1001");

        assertNotNull(response);
        assertEquals("1001", response.getId());
        assertEquals("John", response.getFirstName());
    }

    @Test
    void getEmployeeById_NotFound_ThrowsException() {
        when(employeeRepository.findById("9999")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> employeeService.getEmployeeById("9999"));
    }

    @Test
    void getAllEmployees_Success() {
        when(employeeRepository.findAll()).thenReturn(List.of(sampleEmployee));

        List<EmployeeResponse> responses = employeeService.getAllEmployees();

        assertNotNull(responses);
        assertEquals(1, responses.size());
        assertEquals("EMP001", responses.get(0).getEmployeeId());
    }

    @Test
    void updateEmployee_Success() {
        when(employeeRepository.findById("1001")).thenReturn(Optional.of(sampleEmployee));
        when(employeeRepository.save(any(Employee.class))).thenReturn(sampleEmployee);

        EmployeeResponse response = employeeService.updateEmployee("1001", sampleRequest);

        assertNotNull(response);
        assertEquals("1001", response.getId());
        verify(employeeRepository, times(1)).save(any(Employee.class));
    }

    @Test
    void updateEmployee_NotFound_ThrowsException() {
        when(employeeRepository.findById("9999")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> employeeService.updateEmployee("9999", sampleRequest));
    }

    @Test
    void deleteEmployee_Success() {
        when(employeeRepository.existsById("1001")).thenReturn(true);

        assertDoesNotThrow(() -> employeeService.deleteEmployee("1001"));
        verify(employeeRepository, times(1)).deleteById("1001");
    }

    @Test
    void deleteEmployee_NotFound_ThrowsException() {
        when(employeeRepository.existsById("9999")).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> employeeService.deleteEmployee("9999"));
        verify(employeeRepository, never()).deleteById(anyString());
    }
}
