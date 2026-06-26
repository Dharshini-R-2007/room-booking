package com.yourapp.classroombooking.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "classroom_id", nullable = false)
    private Classroom classroom;

    @ManyToOne(optional = false)
    @JoinColumn(name = "time_slot_id", nullable = false)
    private TimeSlot timeSlot;

    @Column(name = "booking_date", nullable = false)
    private LocalDate bookingDate;

    @ManyToOne(optional = false)
    @JoinColumn(name = "booked_by_user_id", nullable = false)
    private User bookedByUser;

    @Column(name = "booked_for_class", nullable = false)
    private String bookedForClass;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingPurpose purpose;

    @Column(name = "custom_purpose")
    private String customPurpose;

    @ManyToOne
    @JoinColumn(name = "faculty_sponsor_id")
    private Faculty facultySponsor;

    @Column(name = "expected_strength", nullable = false)
    private Integer expectedStrength;

    @Column(name = "projector_required", nullable = false)
    private Boolean projectorRequired;

    @Column(name = "equipment_needed")
    private String equipmentNeeded;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
