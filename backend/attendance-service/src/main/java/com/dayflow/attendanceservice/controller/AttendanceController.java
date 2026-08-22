package com.dayflow.attendanceservice.controller;

import com.dayflow.attendanceservice.model.Attendance;
import com.dayflow.attendanceservice.service.AttendanceService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<Attendance> checkIn(@PathVariable String employeeId) {
        Attendance attendance = attendanceService.checkIn(employeeId);
        return ResponseEntity.ok(attendance);
    }

    @PostMapping("/check-out/{employeeId}")
    public ResponseEntity<Attendance> checkOut(@PathVariable String employeeId) {
        Attendance attendance = attendanceService.checkOut(employeeId);
        return ResponseEntity.ok(attendance);
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<Attendance>> getEmployeeAttendance(@PathVariable String employeeId) {
        return ResponseEntity.ok(attendanceService.getAttendanceByEmployee(employeeId));
    }

    @GetMapping("/employee/{employeeId}/date/{date}")
    public ResponseEntity<Attendance> getEmployeeAttendanceByDate(
            @PathVariable String employeeId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getAttendanceByEmployeeAndDate(employeeId, date));
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<Attendance>> getAttendanceByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getAttendanceByDate(date));
    }
}
