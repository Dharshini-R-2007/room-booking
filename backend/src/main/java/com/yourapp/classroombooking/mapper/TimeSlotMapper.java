package com.yourapp.classroombooking.mapper;

import com.yourapp.classroombooking.dto.TimeSlotResponse;
import com.yourapp.classroombooking.entity.TimeSlot;

public class TimeSlotMapper {

    public static TimeSlotResponse toResponse(TimeSlot timeSlot) {
        if (timeSlot == null) {
            return null;
        }

        return TimeSlotResponse.builder()
                .id(timeSlot.getId())
                .periodNumber(timeSlot.getPeriodNumber())
                .label(timeSlot.getLabel())
                .startTime(timeSlot.getStartTime())
                .endTime(timeSlot.getEndTime())
                .active(timeSlot.getActive())
                .createdAt(timeSlot.getCreatedAt())
                .updatedAt(timeSlot.getUpdatedAt())
                .build();
    }
}
