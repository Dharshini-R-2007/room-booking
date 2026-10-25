package com.yourapp.classroombooking.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassroomScheduleResponse {
    private Long classroomId;
    private String roomNumber;
    private LocalDate bookingDate;
    private List<ClassroomSchedulePeriod> periods;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ClassroomSchedulePeriod {
        private Integer periodNumber;
        private String periodLabel;
        private LocalTime startTime;
        private LocalTime endTime;
        private String availability; // "AVAILABLE" or "BOOKED"
        private Long bookingId;
        private String bookedForClass;
        private String purpose;
        private String bookedByUsername;
        private String bookingStatus;
    }
}
