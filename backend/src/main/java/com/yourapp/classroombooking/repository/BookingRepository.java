package com.yourapp.classroombooking.repository;

import com.yourapp.classroombooking.entity.Booking;
import com.yourapp.classroombooking.entity.BookingStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Pageable;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long>, JpaSpecificationExecutor<Booking> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM Booking b WHERE b.classroom.id = :classroomId AND b.bookingDate = :bookingDate AND b.timeSlot.id = :timeSlotId AND b.status = :status")
    List<Booking> findBookingsForUpdate(
            @Param("classroomId") Long classroomId,
            @Param("bookingDate") LocalDate bookingDate,
            @Param("timeSlotId") Long timeSlotId,
            @Param("status") BookingStatus status);

    boolean existsByClassroomIdAndBookingDateAndTimeSlotIdAndStatus(
            Long classroomId,
            LocalDate bookingDate,
            Long timeSlotId,
            BookingStatus status);

    boolean existsByTimeSlotId(Long timeSlotId);

    List<Booking> findByBookedByUserUsername(String username);

    long countByStatus(BookingStatus status);

    long countByBookingDate(java.time.LocalDate bookingDate);

    long countByBookingDateGreaterThanEqualAndStatus(java.time.LocalDate bookingDate, BookingStatus status);

    @Query("SELECT COUNT(DISTINCT b.classroom.id) FROM Booking b")
    long countDistinctClassroomsBooked();

    @Query("SELECT b.classroom.roomNumber FROM Booking b GROUP BY b.classroom.roomNumber ORDER BY COUNT(b) DESC")
    List<String> findMostBookedClassrooms(Pageable pageable);

    @Query("SELECT b FROM Booking b JOIN FETCH b.timeSlot JOIN FETCH b.bookedByUser LEFT JOIN FETCH b.facultySponsor WHERE b.classroom.id = :classroomId AND b.bookingDate = :bookingDate")
    List<Booking> findBookingsByClassroomAndDate(@Param("classroomId") Long classroomId, @Param("bookingDate") LocalDate bookingDate);

    @Query("SELECT b FROM Booking b JOIN FETCH b.classroom JOIN FETCH b.timeSlot JOIN FETCH b.bookedByUser LEFT JOIN FETCH b.facultySponsor WHERE b.bookedForClass = :className AND (:fromDate IS NULL OR b.bookingDate >= :fromDate) AND (:toDate IS NULL OR b.bookingDate <= :toDate) ORDER BY b.bookingDate ASC, b.timeSlot.periodNumber ASC")
    List<Booking> findBookingsByClassAndDateRange(@Param("className") String className, @Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate);
}

