package com.dayflow.leaveservice.controller;

import com.dayflow.leaveservice.dto.LeaveRequest;
import com.dayflow.leaveservice.dto.LeaveResponse;
import com.dayflow.leaveservice.service.LeaveService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService leaveService;

    @PostMapping
    public ResponseEntity<LeaveResponse> applyForLeave(@Valid @RequestBody LeaveRequest request, Authentication authentication) {
        validateEmployeeIdentity(request.getEmployeeId(), authentication);
        LeaveResponse created = leaveService.applyForLeave(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<LeaveResponse>> getEmployeeLeaves(@PathVariable String employeeId, Authentication authentication) {
        validateEmployeeIdentity(employeeId, authentication);
        List<LeaveResponse> leaves = leaveService.getEmployeeLeaves(employeeId);
        return ResponseEntity.ok(leaves);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LeaveResponse> getLeaveById(@PathVariable String id, Authentication authentication) {
        LeaveResponse leave = leaveService.getLeaveById(id);
        validateEmployeeIdentity(leave.getEmployeeId(), authentication);
        return ResponseEntity.ok(leave);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<LeaveResponse>> getPendingLeaves() {
        List<LeaveResponse> leaves = leaveService.getPendingLeaves();
        return ResponseEntity.ok(leaves);
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<LeaveResponse> approveLeave(@PathVariable String id) {
        LeaveResponse approved = leaveService.approveLeave(id);
        return ResponseEntity.ok(approved);
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<LeaveResponse> rejectLeave(@PathVariable String id) {
        LeaveResponse rejected = leaveService.rejectLeave(id);
        return ResponseEntity.ok(rejected);
    }

    private void validateEmployeeIdentity(String targetEmployeeId, Authentication authentication) {
        if (authentication == null) {
            throw new AccessDeniedException("Full authentication is required.");
        }
        boolean isHrOrAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_HR") || a.getAuthority().equals("ROLE_ADMIN"));
        if (!isHrOrAdmin) {
            String currentLoginId = authentication.getName();
            if (targetEmployeeId == null || !currentLoginId.equalsIgnoreCase(targetEmployeeId)) {
                throw new AccessDeniedException("Access denied: You can only manage your own leave requests.");
            }
        }
    }
}
