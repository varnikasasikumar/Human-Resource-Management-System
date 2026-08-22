package com.dayflow.leaveservice.service;

import com.dayflow.leaveservice.dto.LeaveRequest;
import com.dayflow.leaveservice.dto.LeaveResponse;

import java.util.List;

public interface LeaveService {
    LeaveResponse applyForLeave(LeaveRequest request);
    List<LeaveResponse> getEmployeeLeaves(String employeeId);
    LeaveResponse getLeaveById(String id);
    List<LeaveResponse> getPendingLeaves();
    LeaveResponse approveLeave(String id);
    LeaveResponse rejectLeave(String id);
}
