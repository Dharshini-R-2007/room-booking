package com.yourapp.classroombooking.service;

import com.yourapp.classroombooking.dto.ClassroomScheduleResponse;
import com.yourapp.classroombooking.dto.FacultyBookingSummaryResponse;
import com.yourapp.classroombooking.dto.FacultyBookingViewResponse;
import com.yourapp.classroombooking.entity.*;
import com.yourapp.classroombooking.exception.*;
import com.yourapp.classroombooking.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FacultyDashboardServiceImpl implements FacultyDashboardService {

    private final BookingRepository bookingRepository;
    private final ClassroomRepository classroomRepository;
    private final TimeSlotRepository timeSlotRepository;

    @Override
    @Transactional(readOnly = true)
    public FacultyBookingSummaryResponse getSummary() {
        LocalDate today = LocalDate.now();
        long total = bookingRepository.count();
        long confirmed = bookingRepository.countByStatus(BookingStatus.CONFIRMED);
        long cancelled = bookingRepository.countByStatus(BookingStatus.CANCELLED);
        long todayCount = bookingRepository.countByBookingDate(today);
        long upcoming = bookingRepository.countByBookingDateGreaterThanEqualAndStatus(today, BookingStatus.CONFIRMED);
        long totalClassrooms = bookingRepository.countDistinctClassroomsBooked();

        List<String> mostBooked = bookingRepository.findMostBookedClassrooms(PageRequest.of(0, 1));
        String mostBookedRoom = mostBooked.isEmpty() ? "N/A" : mostBooked.get(0);

        return FacultyBookingSummaryResponse.builder()
                .totalBookings(total)
                .confirmedBookings(confirmed)
                .cancelledBookings(cancelled)
                .bookingsToday(todayCount)
                .upcomingBookings(upcoming)
                .totalClassroomsBooked(totalClassrooms)
                .mostBookedClassroom(mostBookedRoom)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<FacultyBookingViewResponse> getBookings(
            LocalDate bookingDate,
            LocalDate fromDate,
            LocalDate toDate,
            Long classroomId,
            Long timeSlotId,
            String bookedForClass,
            BookingStatus status,
            BookingPurpose purpose,
            Pageable pageable) {

        Specification<Booking> spec = (root, query, cb) -> {
            // Eagerly fetch relations to prevent N+1 queries. Only perform fetch join on non-count queries.
            if (query.getResultType() != Long.class && query.getResultType() != long.class) {
                root.fetch("classroom", JoinType.INNER);
                root.fetch("timeSlot", JoinType.INNER);
                root.fetch("bookedByUser", JoinType.INNER);
                root.fetch("facultySponsor", JoinType.LEFT);
            }

            List<Predicate> predicates = new ArrayList<>();

            if (bookingDate != null) {
                predicates.add(cb.equal(root.get("bookingDate"), bookingDate));
            }
            if (fromDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("bookingDate"), fromDate));
            }
            if (toDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("bookingDate"), toDate));
            }
            if (classroomId != null) {
                predicates.add(cb.equal(root.get("classroom").get("id"), classroomId));
            }
            if (timeSlotId != null) {
                predicates.add(cb.equal(root.get("timeSlot").get("id"), timeSlotId));
            }
            if (bookedForClass != null && !bookedForClass.trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("bookedForClass")), "%" + bookedForClass.trim().toLowerCase() + "%"));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (purpose != null) {
                predicates.add(cb.equal(root.get("purpose"), purpose));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return bookingRepository.findAll(spec, pageable).map(this::mapToViewResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public FacultyBookingViewResponse getBookingById(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found with ID: " + bookingId));
        return mapToViewResponse(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public ClassroomScheduleResponse getClassroomSchedule(Long classroomId, LocalDate date) {
        Classroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new ClassroomNotFoundException("Classroom not found with ID: " + classroomId));

        List<TimeSlot> activeSlots = timeSlotRepository.findByActiveTrueOrderByPeriodNumberAsc();
        List<Booking> bookings = bookingRepository.findBookingsByClassroomAndDate(classroomId, date);

        List<ClassroomScheduleResponse.ClassroomSchedulePeriod> periods = activeSlots.stream().map(slot -> {
            Booking booking = bookings.stream()
                    .filter(b -> b.getTimeSlot().getId().equals(slot.getId()) && b.getStatus() == BookingStatus.CONFIRMED)
                    .findFirst()
                    .orElse(null);

            ClassroomScheduleResponse.ClassroomSchedulePeriod period = ClassroomScheduleResponse.ClassroomSchedulePeriod.builder()
                    .periodNumber(slot.getPeriodNumber())
                    .periodLabel(slot.getLabel())
                    .startTime(slot.getStartTime())
                    .endTime(slot.getEndTime())
                    .build();

            if (booking != null) {
                period.setAvailability("BOOKED");
                period.setBookingId(booking.getId());
                period.setBookedForClass(booking.getBookedForClass());
                period.setPurpose(booking.getPurpose() != null ? booking.getPurpose().name() : null);
                period.setBookedByUsername(booking.getBookedByUser() != null ? booking.getBookedByUser().getUsername() : null);
                period.setBookingStatus(booking.getStatus().name());
            } else {
                period.setAvailability("AVAILABLE");
            }
            return period;
        }).collect(Collectors.toList());

        return ClassroomScheduleResponse.builder()
                .classroomId(classroom.getId())
                .roomNumber(classroom.getRoomNumber())
                .bookingDate(date)
                .periods(periods)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<FacultyBookingViewResponse> getBookingsByClass(String className, LocalDate fromDate, LocalDate toDate) {
        if (fromDate != null && toDate != null && fromDate.isAfter(toDate)) {
            throw new InvalidDateRangeException("From date must be before or equal to to date");
        }

        List<Booking> bookings = bookingRepository.findBookingsByClassAndDateRange(className, fromDate, toDate);
        return bookings.stream()
                .map(this::mapToViewResponse)
                .collect(Collectors.toList());
    }

    private FacultyBookingViewResponse mapToViewResponse(Booking booking) {
        if (booking == null) return null;
        return FacultyBookingViewResponse.builder()
                .bookingId(booking.getId())
                .bookingDate(booking.getBookingDate())
                .bookingStatus(booking.getStatus())
                .roomNumber(booking.getClassroom() != null ? booking.getClassroom().getRoomNumber() : null)
                .building(booking.getClassroom() != null ? booking.getClassroom().getBuilding() : null)
                .classroomType(booking.getClassroom() != null ? booking.getClassroom().getClassroomType() : null)
                .timeSlotId(booking.getTimeSlot() != null ? booking.getTimeSlot().getId() : null)
                .periodNumber(booking.getTimeSlot() != null ? booking.getTimeSlot().getPeriodNumber() : null)
                .periodLabel(booking.getTimeSlot() != null ? booking.getTimeSlot().getLabel() : null)
                .startTime(booking.getTimeSlot() != null ? booking.getTimeSlot().getStartTime() : null)
                .endTime(booking.getTimeSlot() != null ? booking.getTimeSlot().getEndTime() : null)
                .bookedForClass(booking.getBookedForClass())
                .purpose(booking.getPurpose())
                .customPurpose(booking.getCustomPurpose())
                .expectedStrength(booking.getExpectedStrength())
                .projectorRequired(booking.getProjectorRequired())
                .equipmentNeeded(booking.getEquipmentNeeded())
                .bookedByUsername(booking.getBookedByUser() != null ? booking.getBookedByUser().getUsername() : null)
                .bookedByRole(booking.getBookedByUser() != null && booking.getBookedByUser().getRole() != null ? booking.getBookedByUser().getRole().name() : null)
                .facultySponsorName(booking.getFacultySponsor() != null ? (booking.getFacultySponsor().getFirstName() + " " + booking.getFacultySponsor().getLastName()).trim() : null)
                .createdAt(booking.getCreatedAt())
                .build();
    }
}
