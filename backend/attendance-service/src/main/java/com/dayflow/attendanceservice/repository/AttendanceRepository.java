package com.dayflow.attendanceservice.repository;

import com.dayflow.attendanceservice.model.Attendance;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends MongoRepository<Attendance, String> {
    
    Optional<Attendance> findByEmployeeIdAndDate(String employeeId, LocalDate date);
    
    List<Attendance> findByEmployeeId(String employeeId);
    
    List<Attendance> findByDate(LocalDate date);
}
