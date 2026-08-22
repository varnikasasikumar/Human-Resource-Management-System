package com.dayflow.leaveservice.service;

import com.dayflow.leaveservice.dto.LeaveRequest;
import com.dayflow.leaveservice.dto.LeaveResponse;
import com.dayflow.leaveservice.exception.InvalidLeaveRequestException;
import com.dayflow.leaveservice.exception.InvalidLeaveStateException;
import com.dayflow.leaveservice.exception.ResourceNotFoundException;
import com.dayflow.leaveservice.model.Leave;
import com.dayflow.leaveservice.model.LeaveStatus;
import com.dayflow.leaveservice.repository.LeaveRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaveServiceImpl implements LeaveService {

    private final LeaveRepository leaveRepository;

    @Override
    public LeaveResponse applyForLeave(LeaveRequest request) {
        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new InvalidLeaveRequestException("Start date (" + request.getStartDate() + ") cannot be after end date (" + request.getEndDate() + ")");
        }

        Leave leave = Leave.builder()
                .employeeId(request.getEmployeeId())
                .leaveType(request.getLeaveType())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .reason(request.getReason())
                .status(LeaveStatus.PENDING)
                .appliedAt(LocalDateTime.now())
                .build();

        Leave saved = leaveRepository.save(leave);
        return mapToResponse(saved);
    }

    @Override
    public List<LeaveResponse> getEmployeeLeaves(String employeeId) {
        return leaveRepository.findByEmployeeId(employeeId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public LeaveResponse getLeaveById(String id) {
        Leave leave = leaveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with id: " + id));
        return mapToResponse(leave);
    }

    @Override
    public List<LeaveResponse> getPendingLeaves() {
        return leaveRepository.findByStatus(LeaveStatus.PENDING).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public LeaveResponse approveLeave(String id) {
        Leave leave = leaveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with id: " + id));

        if (leave.getStatus() != LeaveStatus.PENDING) {
            throw new InvalidLeaveStateException("Leave request with id '" + id + "' is already " + leave.getStatus());
        }

        leave.setStatus(LeaveStatus.APPROVED);
        Leave updated = leaveRepository.save(leave);
        return mapToResponse(updated);
    }

    @Override
    public LeaveResponse rejectLeave(String id) {
        Leave leave = leaveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with id: " + id));

        if (leave.getStatus() != LeaveStatus.PENDING) {
            throw new InvalidLeaveStateException("Leave request with id '" + id + "' is already " + leave.getStatus());
        }

        leave.setStatus(LeaveStatus.REJECTED);
        Leave updated = leaveRepository.save(leave);
        return mapToResponse(updated);
    }

    private LeaveResponse mapToResponse(Leave leave) {
        return LeaveResponse.builder()
                .id(leave.getId())
                .employeeId(leave.getEmployeeId())
                .leaveType(leave.getLeaveType())
                .startDate(leave.getStartDate())
                .endDate(leave.getEndDate())
                .reason(leave.getReason())
                .status(leave.getStatus())
                .appliedAt(leave.getAppliedAt())
                .build();
    }
}
