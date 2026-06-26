package com.yourapp.classroombooking.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "classrooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Classroom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_number", unique = true, nullable = false)
    private String roomNumber;

    @Column(nullable = false)
    private String building;

    private String floor;

    @Enumerated(EnumType.STRING)
    @Column(name = "classroom_type", nullable = false)
    private ClassroomType classroomType;

    @Column(nullable = false)
    private Integer capacity;

    @Column(name = "has_projector", nullable = false)
    private Boolean hasProjector;

    @Column(name = "equipment_details")
    private String equipmentDetails;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ClassroomStatus status;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
