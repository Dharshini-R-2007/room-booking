package com.yourapp.classroombooking.service;

import com.yourapp.classroombooking.dto.*;
import com.yourapp.classroombooking.entity.BookingStatus;

import java.time.LocalDate;
import java.util.List;

public interface BookingService {

    List<AvailableClassroomResponse> checkAvailableClassrooms(CheckAvailabilityRequest request);

    BookingResponse createBooking(CreateBookingRequest request, String username);

    List<BookingResponse> getMyBookings(String username);

    List<BookingResponse> getBookingsWithFilters(
            LocalDate bookingDate,
            Long classroomId,
            Long timeSlotId,
            String bookedForClass,
            BookingStatus status);

    BookingResponse getBookingById(Long id, String username);
}
