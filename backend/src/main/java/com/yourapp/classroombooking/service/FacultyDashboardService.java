package com.yourapp.classroombooking.service;

import com.yourapp.classroombooking.dto.ClassroomScheduleResponse;
import com.yourapp.classroombooking.dto.FacultyBookingSummaryResponse;
import com.yourapp.classroombooking.dto.FacultyBookingViewResponse;
import com.yourapp.classroombooking.entity.BookingPurpose;
import com.yourapp.classroombooking.entity.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface FacultyDashboardService {

    FacultyBookingSummaryResponse getSummary();

    Page<FacultyBookingViewResponse> getBookings(
            LocalDate bookingDate,
            LocalDate fromDate,
            LocalDate toDate,
            Long classroomId,
            Long timeSlotId,
            String bookedForClass,
            BookingStatus status,
            BookingPurpose purpose,
            Pageable pageable);

    FacultyBookingViewResponse getBookingById(Long bookingId);

    ClassroomScheduleResponse getClassroomSchedule(Long classroomId, LocalDate date);

    List<FacultyBookingViewResponse> getBookingsByClass(
            String className,
            LocalDate fromDate,
            LocalDate toDate);
}
