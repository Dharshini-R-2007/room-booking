package com.yourapp.classroombooking.mapper;

import com.yourapp.classroombooking.dto.BookingResponse;
import com.yourapp.classroombooking.entity.Booking;

public class BookingMapper {

    public static BookingResponse toResponse(Booking booking) {
        if (booking == null) {
            return null;
        }

        return BookingResponse.builder()
                .id(booking.getId())
                .classroomId(booking.getClassroom() != null ? booking.getClassroom().getId() : null)
                .roomNumber(booking.getClassroom() != null ? booking.getClassroom().getRoomNumber() : null)
                .classroomType(booking.getClassroom() != null ? booking.getClassroom().getClassroomType() : null)
                .bookingDate(booking.getBookingDate())
                .timeSlotId(booking.getTimeSlot() != null ? booking.getTimeSlot().getId() : null)
                .periodLabel(booking.getTimeSlot() != null ? booking.getTimeSlot().getLabel() : null)
                .startTime(booking.getTimeSlot() != null ? booking.getTimeSlot().getStartTime() : null)
                .endTime(booking.getTimeSlot() != null ? booking.getTimeSlot().getEndTime() : null)
                .bookedByUsername(booking.getBookedByUser() != null ? booking.getBookedByUser().getUsername() : null)
                .bookedByRole(booking.getBookedByUser() != null && booking.getBookedByUser().getRole() != null ? 
                        booking.getBookedByUser().getRole().name() : null)
                .bookedForClass(booking.getBookedForClass())
                .purpose(booking.getPurpose())
                .customPurpose(booking.getCustomPurpose())
                .facultySponsorId(booking.getFacultySponsor() != null ? booking.getFacultySponsor().getId() : null)
                .facultySponsorName(booking.getFacultySponsor() != null ? 
                        (booking.getFacultySponsor().getFirstName() + " " + booking.getFacultySponsor().getLastName()).trim() : null)
                .expectedStrength(booking.getExpectedStrength())
                .projectorRequired(booking.getProjectorRequired())
                .equipmentNeeded(booking.getEquipmentNeeded())
                .status(booking.getStatus())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}
