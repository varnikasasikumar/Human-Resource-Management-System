package com.dayflow.attendanceservice.controller;

import com.dayflow.attendanceservice.model.Attendance;
import com.dayflow.attendanceservice.service.AttendanceService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @PostMapping("/check-in/{employeeId}")
    public ResponseEntity<Attendance> checkIn(@PathVariable String employeeId, Authentication authentication) {
        validateEmployeeIdentity(employeeId, authentication);
        Attendance attendance = attendanceService.checkIn(employeeId);
        return ResponseEntity.ok(attendance);
    }

    @PostMapping("/check-out/{employeeId}")
    public ResponseEntity<Attendance> checkOut(@PathVariable String employeeId, Authentication authentication) {
        validateEmployeeIdentity(employeeId, authentication);
        Attendance attendance = attendanceService.checkOut(employeeId);
        return ResponseEntity.ok(attendance);
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<Attendance>> getEmployeeAttendance(@PathVariable String employeeId, Authentication authentication) {
        validateEmployeeIdentity(employeeId, authentication);
        return ResponseEntity.ok(attendanceService.getAttendanceByEmployee(employeeId));
    }

    @GetMapping("/employee/{employeeId}/date/{date}")
    public ResponseEntity<Attendance> getEmployeeAttendanceByDate(
            @PathVariable String employeeId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            Authentication authentication) {
        validateEmployeeIdentity(employeeId, authentication);
        return ResponseEntity.ok(attendanceService.getAttendanceByEmployeeAndDate(employeeId, date));
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<Attendance>> getAttendanceByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getAttendanceByDate(date));
    }

    private void validateEmployeeIdentity(String targetEmployeeId, Authentication authentication) {
        if (authentication == null) {
            throw new AccessDeniedException("Full authentication is required.");
        }
        boolean isHrOrAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_HR") || a.getAuthority().equals("ROLE_ADMIN"));
        if (!isHrOrAdmin) {
            String currentLoginId = authentication.getName();
            if (!currentLoginId.equalsIgnoreCase(targetEmployeeId)) {
                throw new AccessDeniedException("Access denied: You can only access your own attendance records.");
            }
        }
    }
}
