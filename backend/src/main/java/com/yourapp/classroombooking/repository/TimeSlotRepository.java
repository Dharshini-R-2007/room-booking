package com.yourapp.classroombooking.repository;

import com.yourapp.classroombooking.entity.TimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TimeSlotRepository extends JpaRepository<TimeSlot, Long> {

    Optional<TimeSlot> findByPeriodNumber(Integer periodNumber);

    boolean existsByPeriodNumber(Integer periodNumber);

    List<TimeSlot> findByActiveTrueOrderByPeriodNumberAsc();

    List<TimeSlot> findAllByOrderByPeriodNumberAsc();

    @Query("SELECT COUNT(t) > 0 FROM TimeSlot t WHERE t.active = true AND t.startTime < :endTime AND t.endTime > :startTime")

    boolean existsOverlappingActive(@Param("startTime") LocalTime startTime, @Param("endTime") LocalTime endTime);

    @Query("SELECT COUNT(t) > 0 FROM TimeSlot t WHERE t.active = true AND t.id != :id AND t.startTime < :endTime AND t.endTime > :startTime")
    boolean existsOverlappingActiveExcludingId(@Param("id") Long id, @Param("startTime") LocalTime startTime, @Param("endTime") LocalTime endTime);
}
