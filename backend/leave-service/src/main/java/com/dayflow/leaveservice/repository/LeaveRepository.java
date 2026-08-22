package com.dayflow.leaveservice.repository;

import com.dayflow.leaveservice.model.Leave;
import com.dayflow.leaveservice.model.LeaveStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRepository extends MongoRepository<Leave, String> {
    List<Leave> findByEmployeeId(String employeeId);
    List<Leave> findByStatus(LeaveStatus status);
}
