package com.yourapp.classroombooking.dto;

import com.yourapp.classroombooking.entity.BookingPurpose;
import com.yourapp.classroombooking.entity.BookingStatus;
import com.yourapp.classroombooking.entity.ClassroomType;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FacultyBookingViewResponse {
    private Long bookingId;
    private LocalDate bookingDate;
    private BookingStatus bookingStatus;
    private String roomNumber;
    private String building;
    private ClassroomType classroomType;
    private Long timeSlotId;
    private Integer periodNumber;
    private String periodLabel;
    private LocalTime startTime;
    private LocalTime endTime;
    private String bookedForClass;
    private BookingPurpose purpose;
    private String customPurpose;
    private Integer expectedStrength;
    private Boolean projectorRequired;
    private String equipmentNeeded;
    private String bookedByUsername;
    private String bookedByRole;
    private String facultySponsorName;
    private LocalDateTime createdAt;

    public Long getId() {
        return bookingId;
    }

    public BookingStatus getStatus() {
        return bookingStatus;
    }
}
