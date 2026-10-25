package com.yourapp.classroombooking.controller;

import com.yourapp.classroombooking.dto.*;
import com.yourapp.classroombooking.entity.BookingStatus;
import com.yourapp.classroombooking.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping("/available")
    @PreAuthorize("hasAnyRole('FACULTY', 'STUDENT')")
    public ResponseEntity<ApiResponse<List<AvailableClassroomResponse>>> checkAvailableClassrooms(
            @Valid @RequestBody CheckAvailabilityRequest request) {
        List<AvailableClassroomResponse> data = bookingService.checkAvailableClassrooms(request);
        return ResponseEntity.ok(ApiResponse.success("Available classrooms retrieved successfully", data));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('FACULTY', 'STUDENT')")
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @Valid @RequestBody CreateBookingRequest request,
            Principal principal) {
        BookingResponse data = bookingService.createBooking(request, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Booking created successfully", data));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('FACULTY', 'STUDENT')")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getMyBookings(Principal principal) {
        List<BookingResponse> data = bookingService.getMyBookings(principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Your bookings retrieved successfully", data));
    }

    @GetMapping
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getBookings(
            @RequestParam(required = false) LocalDate bookingDate,
            @RequestParam(required = false) Long classroomId,
            @RequestParam(required = false) Long timeSlotId,
            @RequestParam(required = false) String bookedForClass,
            @RequestParam(required = false) BookingStatus status) {
        List<BookingResponse> data = bookingService.getBookingsWithFilters(
                bookingDate, classroomId, timeSlotId, bookedForClass, status);
        return ResponseEntity.ok(ApiResponse.success("Bookings retrieved successfully", data));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('FACULTY', 'STUDENT')")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(
            @PathVariable Long id,
            Principal principal) {
        BookingResponse data = bookingService.getBookingById(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Booking retrieved successfully", data));
    }
}
