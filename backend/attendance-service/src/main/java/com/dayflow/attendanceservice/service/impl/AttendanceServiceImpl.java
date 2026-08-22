package com.dayflow.attendanceservice.service.impl;

import com.dayflow.attendanceservice.exception.InvalidAttendanceActionException;
import com.dayflow.attendanceservice.exception.ResourceNotFoundException;
import com.dayflow.attendanceservice.model.Attendance;
import com.dayflow.attendanceservice.model.AttendanceStatus;
import com.dayflow.attendanceservice.repository.AttendanceRepository;
import com.dayflow.attendanceservice.service.AttendanceService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;

    public AttendanceServiceImpl(AttendanceRepository attendanceRepository) {
        this.attendanceRepository = attendanceRepository;
    }

    @Override
    public Attendance checkIn(String employeeId) {
        LocalDate today = LocalDate.now();
        
        Optional<Attendance> existingRecord = attendanceRepository.findByEmployeeIdAndDate(employeeId, today);
        if (existingRecord.isPresent()) {
            throw new InvalidAttendanceActionException("Employee has already checked in today.");
        }

        Attendance attendance = new Attendance();
        attendance.setEmployeeId(employeeId);
        attendance.setDate(today);
        attendance.setCheckInTime(LocalDateTime.now());
        attendance.setStatus(AttendanceStatus.PRESENT);

        return attendanceRepository.save(attendance);
    }

    @Override
    public Attendance checkOut(String employeeId) {
        LocalDate today = LocalDate.now();
        
        Attendance attendance = attendanceRepository.findByEmployeeIdAndDate(employeeId, today)
                .orElseThrow(() -> new InvalidAttendanceActionException("Cannot check out before checking in."));

        if (attendance.getCheckOutTime() != null) {
            throw new InvalidAttendanceActionException("Employee has already checked out today.");
        }

        attendance.setCheckOutTime(LocalDateTime.now());
        return attendanceRepository.save(attendance);
    }

    @Override
    public List<Attendance> getAttendanceByEmployee(String employeeId) {
        return attendanceRepository.findByEmployeeId(employeeId);
    }

    @Override
    public Attendance getAttendanceByEmployeeAndDate(String employeeId, LocalDate date) {
        return attendanceRepository.findByEmployeeIdAndDate(employeeId, date)
                .orElseThrow(() -> new ResourceNotFoundException("No attendance record found for employee " + employeeId + " on " + date));
    }

    @Override
    public List<Attendance> getAttendanceByDate(LocalDate date) {
        return attendanceRepository.findByDate(date);
    }

    @Override
    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }
}
