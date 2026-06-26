package com.yourapp.classroombooking.controller;

import com.yourapp.classroombooking.dto.ApiResponse;
import com.yourapp.classroombooking.dto.CreateTimeSlotRequest;
import com.yourapp.classroombooking.dto.TimeSlotResponse;
import com.yourapp.classroombooking.dto.UpdateTimeSlotRequest;
import com.yourapp.classroombooking.dto.TimeSlotStatusRequest;
import com.yourapp.classroombooking.service.TimeSlotService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/time-slots")
@RequiredArgsConstructor
public class TimeSlotController {

    private final TimeSlotService timeSlotService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TimeSlotResponse>> createTimeSlot(
            @Valid @RequestBody CreateTimeSlotRequest request) {
        TimeSlotResponse data = timeSlotService.createTimeSlot(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Time slot created successfully", data));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'STUDENT')")
    public ResponseEntity<ApiResponse<List<TimeSlotResponse>>> getTimeSlots(
            @RequestParam(value = "includeInactive", required = false, defaultValue = "false") boolean includeInactive,
            HttpServletRequest request) {
        List<TimeSlotResponse> data;
        if (request.isUserInRole("ADMIN") && includeInactive) {
            data = timeSlotService.getAllTimeSlots();
        } else {
            data = timeSlotService.getActiveTimeSlots();
        }
        return ResponseEntity.ok(ApiResponse.success("Time slots retrieved successfully", data));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TimeSlotResponse>> updateTimeSlot(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTimeSlotRequest request) {
        TimeSlotResponse data = timeSlotService.updateTimeSlot(id, request);
        return ResponseEntity.ok(ApiResponse.success("Time slot updated successfully", data));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TimeSlotResponse>> changeTimeSlotStatus(
            @PathVariable Long id,
            @Valid @RequestBody TimeSlotStatusRequest request) {
        TimeSlotResponse data = timeSlotService.changeTimeSlotStatus(id, request.getActive());
        return ResponseEntity.ok(ApiResponse.success("Time slot status updated successfully", data));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteTimeSlot(@PathVariable Long id) {
        timeSlotService.deleteTimeSlot(id);
        return ResponseEntity.ok(ApiResponse.success("Time slot deleted successfully"));
    }
}

