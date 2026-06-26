package com.yourapp.classroombooking.dto;

import com.yourapp.classroombooking.entity.BookingPurpose;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateBookingRequest {

    @NotNull(message = "Classroom ID is required")
    private Long classroomId;

    @NotNull(message = "Time slot ID is required")
    private Long timeSlotId;

    @NotNull(message = "Booking date is required")
    private LocalDate bookingDate;

    @NotBlank(message = "Booked for class/group label is required")
    private String bookedForClass;

    @NotNull(message = "Booking purpose is required")
    private BookingPurpose purpose;

    private String customPurpose;

    private Long facultySponsorId;

    @NotNull(message = "Expected strength is required")
    private Integer expectedStrength;

    @NotNull(message = "Projector required must be specified")
    private Boolean projectorRequired;

    private String equipmentNeeded;
}
