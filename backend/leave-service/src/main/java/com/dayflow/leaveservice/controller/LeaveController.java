package com.dayflow.leaveservice.controller;

import com.dayflow.leaveservice.dto.LeaveRequest;
import com.dayflow.leaveservice.dto.LeaveResponse;
import com.dayflow.leaveservice.service.LeaveService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService leaveService;

    @PostMapping
    public ResponseEntity<LeaveResponse> applyForLeave(@Valid @RequestBody LeaveRequest request) {
        LeaveResponse created = leaveService.applyForLeave(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<LeaveResponse>> getEmployeeLeaves(@PathVariable String employeeId) {
        List<LeaveResponse> leaves = leaveService.getEmployeeLeaves(employeeId);
        return ResponseEntity.ok(leaves);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LeaveResponse> getLeaveById(@PathVariable String id) {
        LeaveResponse leave = leaveService.getLeaveById(id);
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
}
