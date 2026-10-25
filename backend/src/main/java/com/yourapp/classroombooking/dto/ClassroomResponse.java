package com.yourapp.classroombooking.dto;

import com.yourapp.classroombooking.entity.ClassroomStatus;
import com.yourapp.classroombooking.entity.ClassroomType;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassroomResponse {
    private Long id;
    private String roomNumber;
    private String building;
    private String floor;
    private ClassroomType classroomType;
    private Integer capacity;
    private Boolean hasProjector;
    private String equipmentDetails;
    private ClassroomStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
