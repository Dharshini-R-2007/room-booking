package com.yourapp.classroombooking.dto;

import lombok.*;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimeSlotResponse {
    private Long id;
    private Integer periodNumber;
    private String label;
    private LocalTime startTime;
    private LocalTime endTime;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
