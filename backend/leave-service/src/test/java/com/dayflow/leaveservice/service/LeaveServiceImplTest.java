package com.dayflow.leaveservice.service;

import com.dayflow.leaveservice.dto.LeaveRequest;
import com.dayflow.leaveservice.dto.LeaveResponse;
import com.dayflow.leaveservice.exception.InvalidLeaveRequestException;
import com.dayflow.leaveservice.exception.InvalidLeaveStateException;
import com.dayflow.leaveservice.exception.ResourceNotFoundException;
import com.dayflow.leaveservice.model.Leave;
import com.dayflow.leaveservice.model.LeaveStatus;
import com.dayflow.leaveservice.model.LeaveType;
import com.dayflow.leaveservice.repository.LeaveRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LeaveServiceImplTest {

    @Mock
    private LeaveRepository leaveRepository;

    @InjectMocks
    private LeaveServiceImpl leaveService;

    private Leave sampleLeave;
    private LeaveRequest validRequest;

    @BeforeEach
    void setUp() {
        validRequest = LeaveRequest.builder()
                .employeeId("EMP100")
                .leaveType(LeaveType.CASUAL)
                .startDate(LocalDate.of(2026, 9, 1))
                .endDate(LocalDate.of(2026, 9, 5))
                .reason("Vacation trip")
                .build();

        sampleLeave = Leave.builder()
                .id("LV001")
                .employeeId("EMP100")
                .leaveType(LeaveType.CASUAL)
                .startDate(LocalDate.of(2026, 9, 1))
                .endDate(LocalDate.of(2026, 9, 5))
                .reason("Vacation trip")
                .status(LeaveStatus.PENDING)
                .appliedAt(LocalDateTime.now())
                .build();
    }

    @Test
    void applyForLeave_Success() {
        when(leaveRepository.save(any(Leave.class))).thenReturn(sampleLeave);

        LeaveResponse response = leaveService.applyForLeave(validRequest);

        assertNotNull(response);
        assertEquals("LV001", response.getId());
        assertEquals("EMP100", response.getEmployeeId());
        assertEquals(LeaveStatus.PENDING, response.getStatus());
        assertNotNull(response.getAppliedAt());
        verify(leaveRepository, times(1)).save(any(Leave.class));
    }

    @Test
    void applyForLeave_InvalidDateRange_ThrowsException() {
        LeaveRequest invalidDateRequest = LeaveRequest.builder()
                .employeeId("EMP100")
                .leaveType(LeaveType.SICK)
                .startDate(LocalDate.of(2026, 9, 10))
                .endDate(LocalDate.of(2026, 9, 5)) // End date before start date
                .reason("Medical emergency")
                .build();

        assertThrows(InvalidLeaveRequestException.class, () -> leaveService.applyForLeave(invalidDateRequest));
        verify(leaveRepository, never()).save(any(Leave.class));
    }

    @Test
    void getEmployeeLeaves_Success() {
        when(leaveRepository.findByEmployeeId("EMP100")).thenReturn(List.of(sampleLeave));

        List<LeaveResponse> responses = leaveService.getEmployeeLeaves("EMP100");

        assertNotNull(responses);
        assertEquals(1, responses.size());
        assertEquals("EMP100", responses.get(0).getEmployeeId());
    }

    @Test
    void getLeaveById_Success() {
        when(leaveRepository.findById("LV001")).thenReturn(Optional.of(sampleLeave));

        LeaveResponse response = leaveService.getLeaveById("LV001");

        assertNotNull(response);
        assertEquals("LV001", response.getId());
    }

    @Test
    void getLeaveById_NotFound_ThrowsException() {
        when(leaveRepository.findById("LV999")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> leaveService.getLeaveById("LV999"));
    }

    @Test
    void getPendingLeaves_Success() {
        when(leaveRepository.findByStatus(LeaveStatus.PENDING)).thenReturn(List.of(sampleLeave));

        List<LeaveResponse> responses = leaveService.getPendingLeaves();

        assertNotNull(responses);
        assertEquals(1, responses.size());
        assertEquals(LeaveStatus.PENDING, responses.get(0).getStatus());
    }

    @Test
    void approveLeave_Success() {
        when(leaveRepository.findById("LV001")).thenReturn(Optional.of(sampleLeave));
        when(leaveRepository.save(any(Leave.class))).thenAnswer(invocation -> invocation.getArgument(0));

        LeaveResponse response = leaveService.approveLeave("LV001");

        assertNotNull(response);
        assertEquals(LeaveStatus.APPROVED, response.getStatus());
        verify(leaveRepository, times(1)).save(any(Leave.class));
    }

    @Test
    void approveLeave_AlreadyApproved_ThrowsException() {
        sampleLeave.setStatus(LeaveStatus.APPROVED);
        when(leaveRepository.findById("LV001")).thenReturn(Optional.of(sampleLeave));

        assertThrows(InvalidLeaveStateException.class, () -> leaveService.approveLeave("LV001"));
        verify(leaveRepository, never()).save(any(Leave.class));
    }

    @Test
    void rejectLeave_Success() {
        when(leaveRepository.findById("LV001")).thenReturn(Optional.of(sampleLeave));
        when(leaveRepository.save(any(Leave.class))).thenAnswer(invocation -> invocation.getArgument(0));

        LeaveResponse response = leaveService.rejectLeave("LV001");

        assertNotNull(response);
        assertEquals(LeaveStatus.REJECTED, response.getStatus());
        verify(leaveRepository, times(1)).save(any(Leave.class));
    }

    @Test
    void rejectLeave_AlreadyRejected_ThrowsException() {
        sampleLeave.setStatus(LeaveStatus.REJECTED);
        when(leaveRepository.findById("LV001")).thenReturn(Optional.of(sampleLeave));

        assertThrows(InvalidLeaveStateException.class, () -> leaveService.rejectLeave("LV001"));
        verify(leaveRepository, never()).save(any(Leave.class));
    }

    @Test
    void approveLeave_NotFound_ThrowsException() {
        when(leaveRepository.findById("LV999")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> leaveService.approveLeave("LV999"));
    }
}
