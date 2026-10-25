package com.yourapp.classroombooking.dto;

import com.yourapp.classroombooking.entity.ClassroomType;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckAvailabilityRequest {

    @NotNull(message = "Booking date is required")
    private LocalDate bookingDate;

    @NotNull(message = "Time slot ID is required")
    private Long timeSlotId;

    @NotNull(message = "Expected strength is required")
    private Integer expectedStrength;

    @NotNull(message = "Projector required must be specified")
    private Boolean projectorRequired;

    private ClassroomType classroomType;

    private String building;
}
