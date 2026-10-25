package com.yourapp.classroombooking.controller;

import com.yourapp.classroombooking.dto.*;
import com.yourapp.classroombooking.entity.BookingPurpose;
import com.yourapp.classroombooking.entity.BookingStatus;
import com.yourapp.classroombooking.service.FacultyDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/faculty/dashboard")
@RequiredArgsConstructor
public class FacultyDashboardController {

    private final FacultyDashboardService facultyDashboardService;

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<ApiResponse<FacultyBookingSummaryResponse>> getSummary() {
        FacultyBookingSummaryResponse data = facultyDashboardService.getSummary();
        return ResponseEntity.ok(ApiResponse.success("Faculty booking dashboard retrieved successfully", data));
    }

    @GetMapping("/bookings")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<ApiResponse<Page<FacultyBookingViewResponse>>> getBookings(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate bookingDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Long classroomId,
            @RequestParam(required = false) Long timeSlotId,
            @RequestParam(required = false) String bookedForClass,
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) BookingPurpose purpose,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "bookingDate") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection) {

        Sort sort;
        if ("bookingDate".equals(sortBy)) {
            Sort.Order dateOrder = "DESC".equalsIgnoreCase(sortDirection) ?
                    Sort.Order.desc("bookingDate") : Sort.Order.asc("bookingDate");
            Sort.Order periodOrder = Sort.Order.asc("timeSlot.periodNumber");
            sort = Sort.by(dateOrder, periodOrder);
        } else {
            sort = Sort.by("DESC".equalsIgnoreCase(sortDirection) ? Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
        }

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<FacultyBookingViewResponse> data = facultyDashboardService.getBookings(
                bookingDate, fromDate, toDate, classroomId, timeSlotId, bookedForClass, status, purpose, pageable);

        return ResponseEntity.ok(ApiResponse.success("Faculty bookings retrieved successfully", data));
    }

    @GetMapping("/bookings/{bookingId}")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<ApiResponse<FacultyBookingViewResponse>> getBookingById(@PathVariable Long bookingId) {
        FacultyBookingViewResponse data = facultyDashboardService.getBookingById(bookingId);
        return ResponseEntity.ok(ApiResponse.success("Booking details retrieved successfully", data));
    }

    @GetMapping("/classrooms/{classroomId}/schedule")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'STUDENT')")
    public ResponseEntity<ApiResponse<ClassroomScheduleResponse>> getClassroomSchedule(
            @PathVariable Long classroomId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        ClassroomScheduleResponse data = facultyDashboardService.getClassroomSchedule(classroomId, date);
        return ResponseEntity.ok(ApiResponse.success("Classroom schedule retrieved successfully", data));
    }

    @GetMapping("/classes/{className}/bookings")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<FacultyBookingViewResponse>>> getBookingsByClass(
            @PathVariable String className,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        List<FacultyBookingViewResponse> data = facultyDashboardService.getBookingsByClass(className, fromDate, toDate);
        return ResponseEntity.ok(ApiResponse.success("Class bookings retrieved successfully", data));
    }
}
