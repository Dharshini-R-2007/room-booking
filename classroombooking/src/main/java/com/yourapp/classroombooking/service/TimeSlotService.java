package com.yourapp.classroombooking.service;

import com.yourapp.classroombooking.dto.CreateTimeSlotRequest;
import com.yourapp.classroombooking.dto.TimeSlotResponse;
import com.yourapp.classroombooking.dto.UpdateTimeSlotRequest;

import java.util.List;

public interface TimeSlotService {

    TimeSlotResponse createTimeSlot(CreateTimeSlotRequest request);

    TimeSlotResponse updateTimeSlot(Long id, UpdateTimeSlotRequest request);

    TimeSlotResponse changeTimeSlotStatus(Long id, Boolean active);

    void deleteTimeSlot(Long id);


    List<TimeSlotResponse> getAllTimeSlots();

    List<TimeSlotResponse> getActiveTimeSlots();
}
