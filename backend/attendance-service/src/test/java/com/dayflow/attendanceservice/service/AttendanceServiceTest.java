package com.dayflow.attendanceservice.service;

import com.dayflow.attendanceservice.exception.InvalidAttendanceActionException;
import com.dayflow.attendanceservice.exception.ResourceNotFoundException;
import com.dayflow.attendanceservice.model.Attendance;
import com.dayflow.attendanceservice.model.AttendanceStatus;
import com.dayflow.attendanceservice.repository.AttendanceRepository;
import com.dayflow.attendanceservice.service.impl.AttendanceServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class AttendanceServiceTest {

    @Mock
    private AttendanceRepository attendanceRepository;

    @InjectMocks
    private AttendanceServiceImpl attendanceService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCheckIn_Success() {
        String employeeId = "EMP001";
        LocalDate today = LocalDate.now();

        when(attendanceRepository.findByEmployeeIdAndDate(employeeId, today)).thenReturn(Optional.empty());
        
        Attendance mockSaved = new Attendance();
        mockSaved.setEmployeeId(employeeId);
        mockSaved.setDate(today);
        mockSaved.setCheckInTime(LocalDateTime.now());
        mockSaved.setStatus(AttendanceStatus.PRESENT);
        
        when(attendanceRepository.save(any(Attendance.class))).thenReturn(mockSaved);

        Attendance result = attendanceService.checkIn(employeeId);

        assertNotNull(result);
        assertEquals(employeeId, result.getEmployeeId());
        assertEquals(today, result.getDate());
        assertNotNull(result.getCheckInTime());
        assertEquals(AttendanceStatus.PRESENT, result.getStatus());
        
        verify(attendanceRepository, times(1)).save(any(Attendance.class));
    }

    @Test
    void testCheckIn_DuplicateRejection() {
        String employeeId = "EMP001";
        LocalDate today = LocalDate.now();
        
        Attendance existing = new Attendance();
        existing.setEmployeeId(employeeId);

        when(attendanceRepository.findByEmployeeIdAndDate(employeeId, today)).thenReturn(Optional.of(existing));

        InvalidAttendanceActionException exception = assertThrows(InvalidAttendanceActionException.class, () -> {
            attendanceService.checkIn(employeeId);
        });

        assertTrue(exception.getMessage().contains("already checked in"));
        verify(attendanceRepository, never()).save(any(Attendance.class));
    }

    @Test
    void testCheckOut_Success() {
        String employeeId = "EMP001";
        LocalDate today = LocalDate.now();

        Attendance existing = new Attendance();
        existing.setEmployeeId(employeeId);
        existing.setDate(today);
        existing.setCheckInTime(LocalDateTime.now().minusHours(4));
        existing.setStatus(AttendanceStatus.PRESENT);

        when(attendanceRepository.findByEmployeeIdAndDate(employeeId, today)).thenReturn(Optional.of(existing));
        when(attendanceRepository.save(any(Attendance.class))).thenReturn(existing);

        Attendance result = attendanceService.checkOut(employeeId);

        assertNotNull(result);
        assertNotNull(result.getCheckOutTime());
        verify(attendanceRepository, times(1)).save(any(Attendance.class));
    }

    @Test
    void testCheckOut_BeforeCheckInRejection() {
        String employeeId = "EMP001";
        LocalDate today = LocalDate.now();

        when(attendanceRepository.findByEmployeeIdAndDate(employeeId, today)).thenReturn(Optional.empty());

        InvalidAttendanceActionException exception = assertThrows(InvalidAttendanceActionException.class, () -> {
            attendanceService.checkOut(employeeId);
        });

        assertTrue(exception.getMessage().contains("Cannot check out before checking in"));
        verify(attendanceRepository, never()).save(any(Attendance.class));
    }
    
    @Test
    void testCheckOut_DuplicateRejection() {
        String employeeId = "EMP001";
        LocalDate today = LocalDate.now();

        Attendance existing = new Attendance();
        existing.setEmployeeId(employeeId);
        existing.setCheckInTime(LocalDateTime.now().minusHours(8));
        existing.setCheckOutTime(LocalDateTime.now()); // already checked out

        when(attendanceRepository.findByEmployeeIdAndDate(employeeId, today)).thenReturn(Optional.of(existing));

        InvalidAttendanceActionException exception = assertThrows(InvalidAttendanceActionException.class, () -> {
            attendanceService.checkOut(employeeId);
        });

        assertTrue(exception.getMessage().contains("already checked out"));
        verify(attendanceRepository, never()).save(any(Attendance.class));
    }

    @Test
    void testGetAttendanceByEmployee() {
        String employeeId = "EMP001";
        List<Attendance> records = List.of(new Attendance(), new Attendance());

        when(attendanceRepository.findByEmployeeId(employeeId)).thenReturn(records);

        List<Attendance> result = attendanceService.getAttendanceByEmployee(employeeId);

        assertEquals(2, result.size());
        verify(attendanceRepository, times(1)).findByEmployeeId(employeeId);
    }
}
