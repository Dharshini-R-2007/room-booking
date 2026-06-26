package com.yourapp.classroombooking.service;

import com.yourapp.classroombooking.dto.CreateTimeSlotRequest;
import com.yourapp.classroombooking.dto.TimeSlotResponse;
import com.yourapp.classroombooking.dto.UpdateTimeSlotRequest;
import com.yourapp.classroombooking.entity.TimeSlot;
import com.yourapp.classroombooking.exception.*;
import com.yourapp.classroombooking.mapper.TimeSlotMapper;
import com.yourapp.classroombooking.repository.BookingRepository;
import com.yourapp.classroombooking.repository.TimeSlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TimeSlotServiceImpl implements TimeSlotService {

    private final TimeSlotRepository timeSlotRepository;
    private final BookingRepository bookingRepository;

    @Override
    @Transactional
    public TimeSlotResponse createTimeSlot(CreateTimeSlotRequest request) {
        if (request.getPeriodNumber() == null || request.getPeriodNumber() <= 0) {
            throw new InvalidTimeSlotException("Period number must be positive");
        }

        if (request.getStartTime().isAfter(request.getEndTime()) || request.getStartTime().equals(request.getEndTime())) {
            throw new InvalidTimeSlotException("Start time must be before end time");
        }

        if (timeSlotRepository.existsByPeriodNumber(request.getPeriodNumber())) {
            throw new DuplicateTimeSlotException("Period number " + request.getPeriodNumber() + " already exists");
        }

        if (Boolean.TRUE.equals(request.getActive())) {
            boolean overlaps = timeSlotRepository.existsOverlappingActive(request.getStartTime(), request.getEndTime());
            if (overlaps) {
                throw new TimeSlotOverlapException("A new time slot must not overlap with any existing active time slot");
            }
        }

        TimeSlot timeSlot = TimeSlot.builder()
                .periodNumber(request.getPeriodNumber())
                .label(request.getLabel())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .active(request.getActive())
                .build();

        TimeSlot saved = timeSlotRepository.save(timeSlot);
        return TimeSlotMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public TimeSlotResponse updateTimeSlot(Long id, UpdateTimeSlotRequest request) {
        TimeSlot timeSlot = timeSlotRepository.findById(id)
                .orElseThrow(() -> new TimeSlotNotFoundException("Time slot not found with ID: " + id));

        if (request.getStartTime().isAfter(request.getEndTime()) || request.getStartTime().equals(request.getEndTime())) {
            throw new InvalidTimeSlotException("Start time must be before end time");
        }

        if (Boolean.TRUE.equals(request.getActive())) {
            boolean overlaps = timeSlotRepository.existsOverlappingActiveExcludingId(id, request.getStartTime(), request.getEndTime());
            if (overlaps) {
                throw new TimeSlotOverlapException("A new time slot must not overlap with any existing active time slot");
            }
        }

        timeSlot.setLabel(request.getLabel());
        timeSlot.setStartTime(request.getStartTime());
        timeSlot.setEndTime(request.getEndTime());
        timeSlot.setActive(request.getActive());

        TimeSlot updated = timeSlotRepository.save(timeSlot);
        return TimeSlotMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public TimeSlotResponse changeTimeSlotStatus(Long id, Boolean active) {
        TimeSlot timeSlot = timeSlotRepository.findById(id)
                .orElseThrow(() -> new TimeSlotNotFoundException("Time slot not found with ID: " + id));

        if (Boolean.TRUE.equals(active)) {
            boolean overlaps = timeSlotRepository.existsOverlappingActiveExcludingId(id, timeSlot.getStartTime(), timeSlot.getEndTime());
            if (overlaps) {
                throw new TimeSlotOverlapException("A new time slot must not overlap with any existing active time slot");
            }
        }

        timeSlot.setActive(active);
        TimeSlot updated = timeSlotRepository.save(timeSlot);
        return TimeSlotMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void deleteTimeSlot(Long id) {
        if (!timeSlotRepository.existsById(id)) {
            throw new TimeSlotNotFoundException("Time slot not found with ID: " + id);
        }

        if (bookingRepository.existsByTimeSlotId(id)) {
            throw new TimeSlotInUseException("Time slot cannot be deleted because it is already used in a booking");
        }

        timeSlotRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimeSlotResponse> getAllTimeSlots() {
        return timeSlotRepository.findAllByOrderByPeriodNumberAsc().stream()
                .map(TimeSlotMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimeSlotResponse> getActiveTimeSlots() {
        return timeSlotRepository.findByActiveTrueOrderByPeriodNumberAsc().stream()
                .map(TimeSlotMapper::toResponse)
                .collect(Collectors.toList());
    }
}

