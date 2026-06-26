package com.yourapp.classroombooking.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FacultyBookingSummaryResponse {
    private Long totalBookings;
    private Long confirmedBookings;
    private Long cancelledBookings;
    private Long bookingsToday;
    private Long upcomingBookings;
    private Long totalClassroomsBooked;
    private String mostBookedClassroom;
}
