package com.yourapp.classroombooking.service;

import com.yourapp.classroombooking.dto.*;
import com.yourapp.classroombooking.entity.*;
import com.yourapp.classroombooking.exception.*;
import com.yourapp.classroombooking.mapper.BookingMapper;
import com.yourapp.classroombooking.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.criteria.Predicate;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final ClassroomRepository classroomRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final UserRepository userRepository;
    private final FacultyRepository facultyRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AvailableClassroomResponse> checkAvailableClassrooms(CheckAvailabilityRequest request) {
        TimeSlot timeSlot = timeSlotRepository.findById(request.getTimeSlotId())
                .orElseThrow(() -> new TimeSlotNotFoundException("Time slot not found with ID: " + request.getTimeSlotId()));

        Specification<Classroom> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Rule 1: Are ACTIVE
            predicates.add(cb.equal(root.get("status"), ClassroomStatus.ACTIVE));

            // Rule 2: Have capacity >= expectedStrength
            predicates.add(cb.greaterThanOrEqualTo(root.get("capacity"), request.getExpectedStrength()));

            // Rule 3: Have projector when projectorRequired is true
            if (request.getProjectorRequired()) {
                predicates.add(cb.equal(root.get("hasProjector"), true));
            }

            // Rule 4: Match classroomType if requested
            if (request.getClassroomType() != null) {
                predicates.add(cb.equal(root.get("classroomType"), request.getClassroomType()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        List<Classroom> eligibleClassrooms = classroomRepository.findAll(spec);

        // Rule 5: Do not already have a CONFIRMED booking on the requested bookingDate and timeSlot
        return eligibleClassrooms.stream()
                .filter(classroom -> !bookingRepository.existsByClassroomIdAndBookingDateAndTimeSlotIdAndStatus(
                        classroom.getId(), request.getBookingDate(), request.getTimeSlotId(), BookingStatus.CONFIRMED))
                .map(classroom -> AvailableClassroomResponse.builder()
                        .id(classroom.getId())
                        .roomNumber(classroom.getRoomNumber())
                        .building(classroom.getBuilding())
                        .floor(classroom.getFloor())
                        .classroomType(classroom.getClassroomType())
                        .capacity(classroom.getCapacity())
                        .hasProjector(classroom.getHasProjector())
                        .equipmentDetails(classroom.getEquipmentDetails())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BookingResponse createBooking(CreateBookingRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedAccessException("Logged-in user not found"));

        Classroom classroom = classroomRepository.findById(request.getClassroomId())
                .orElseThrow(() -> new ClassroomNotFoundException("Classroom not found with ID: " + request.getClassroomId()));

        TimeSlot timeSlot = timeSlotRepository.findById(request.getTimeSlotId())
                .orElseThrow(() -> new TimeSlotNotFoundException("Time slot not found with ID: " + request.getTimeSlotId()));

        // Validate booking date is in the present or future
        if (request.getBookingDate().isBefore(LocalDate.now())) {
            throw new InvalidBookingException("Booking date cannot be in the past");
        }

        // Validate classroom status
        if (classroom.getStatus() == ClassroomStatus.INACTIVE || classroom.getStatus() == ClassroomStatus.MAINTENANCE) {
            throw new ClassroomNotAvailableException("Cannot book room whose status is " + classroom.getStatus());
        }

        // Validate capacity
        if (request.getExpectedStrength() > classroom.getCapacity()) {
            throw new InvalidBookingException("Expected strength " + request.getExpectedStrength() + " exceeds classroom capacity " + classroom.getCapacity());
        }

        // Validate projector
        if (request.getProjectorRequired() && !classroom.getHasProjector()) {
            throw new InvalidBookingException("Selected classroom does not have a projector");
        }

        // Validate timeslot status
        if (!timeSlot.getActive()) {
            throw new InvalidBookingException("Selected time slot is inactive");
        }

        // Validate purpose
        if (request.getPurpose() == BookingPurpose.OTHER && (request.getCustomPurpose() == null || request.getCustomPurpose().trim().isEmpty())) {
            throw new InvalidBookingException("Custom purpose is required when purpose is OTHER");
        }

        Faculty sponsor = null;

        // Assign/validate sponsor based on role
        if (user.getRole() == Role.STUDENT) {
            if (request.getFacultySponsorId() == null) {
                throw new InvalidBookingException("Faculty sponsor is required for student bookings");
            }
            sponsor = facultyRepository.findById(request.getFacultySponsorId())
                    .orElseThrow(() -> new FacultyNotFoundException("Faculty sponsor not found with ID: " + request.getFacultySponsorId()));
        } else if (user.getRole() == Role.FACULTY) {
            sponsor = facultyRepository.findByEmail(username)
                    .orElseThrow(() -> new FacultyNotFoundException("Faculty profile not found for email: " + username));
        }

        // Concurrency Lock: Lock records matching the criteria to prevent race conditions
        List<Booking> activeConflicts = bookingRepository.findBookingsForUpdate(
                request.getClassroomId(), request.getBookingDate(), request.getTimeSlotId(), BookingStatus.CONFIRMED);

        if (!activeConflicts.isEmpty()) {
            throw new ClassroomNotAvailableException("Classroom is already booked for the selected date and period");
        }

        Booking booking = Booking.builder()
                .classroom(classroom)
                .timeSlot(timeSlot)
                .bookingDate(request.getBookingDate())
                .bookedByUser(user)
                .bookedForClass(request.getBookedForClass())
                .purpose(request.getPurpose())
                .customPurpose(request.getPurpose() == BookingPurpose.OTHER ? request.getCustomPurpose() : null)
                .facultySponsor(sponsor)
                .expectedStrength(request.getExpectedStrength())
                .projectorRequired(request.getProjectorRequired())
                .equipmentNeeded(request.getEquipmentNeeded())
                .status(BookingStatus.CONFIRMED)
                .build();

        Booking saved = bookingRepository.save(booking);
        return BookingMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(String username) {
        return bookingRepository.findByBookedByUserUsername(username).stream()
                .map(BookingMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsWithFilters(
            LocalDate bookingDate,
            Long classroomId,
            Long timeSlotId,
            String bookedForClass,
            BookingStatus status) {

        Specification<Booking> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (bookingDate != null) {
                predicates.add(cb.equal(root.get("bookingDate"), bookingDate));
            }
            if (classroomId != null) {
                predicates.add(cb.equal(root.get("classroom").get("id"), classroomId));
            }
            if (timeSlotId != null) {
                predicates.add(cb.equal(root.get("timeSlot").get("id"), timeSlotId));
            }
            if (bookedForClass != null && !bookedForClass.trim().isEmpty()) {
                predicates.add(cb.equal(cb.lower(root.get("bookedForClass")), bookedForClass.trim().toLowerCase()));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return bookingRepository.findAll(spec).stream()
                .map(BookingMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long id, String username) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found with ID: " + id));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedAccessException("Logged-in user not found"));

        // Access check: Student can view only their own booking. Faculty can view any booking.
        if (user.getRole() == Role.STUDENT && !booking.getBookedByUser().getUsername().equalsIgnoreCase(username)) {
            throw new UnauthorizedAccessException("You are not authorized to view this booking record");
        }

        return BookingMapper.toResponse(booking);
    }
}
