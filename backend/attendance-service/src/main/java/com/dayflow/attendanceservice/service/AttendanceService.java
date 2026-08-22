package com.dayflow.attendanceservice.service;

import com.dayflow.attendanceservice.model.Attendance;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceService {
    
    Attendance checkIn(String employeeId);
    
    Attendance checkOut(String employeeId);
    
    List<Attendance> getAttendanceByEmployee(String employeeId);
    
    Attendance getAttendanceByEmployeeAndDate(String employeeId, LocalDate date);
    
    List<Attendance> getAttendanceByDate(LocalDate date);
    
    List<Attendance> getAllAttendance();
}
