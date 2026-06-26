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
public class BookingResponse {
    private Long id;
    private Long classroomId;
    private String roomNumber;
    private ClassroomType classroomType;
    private LocalDate bookingDate;
    private Long timeSlotId;
    private String periodLabel;
    private LocalTime startTime;
    private LocalTime endTime;
    private String bookedByUsername;
    private String bookedByRole;
    private String bookedForClass;
    private BookingPurpose purpose;
    private String customPurpose;
    private Long facultySponsorId;
    private String facultySponsorName;
    private Integer expectedStrength;
    private Boolean projectorRequired;
    private String equipmentNeeded;
    private BookingStatus status;
    private LocalDateTime createdAt;
}
