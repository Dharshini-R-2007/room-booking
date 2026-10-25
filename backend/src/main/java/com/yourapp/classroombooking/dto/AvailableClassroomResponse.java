package com.yourapp.classroombooking.dto;

import com.yourapp.classroombooking.entity.ClassroomType;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AvailableClassroomResponse {
    private Long id;
    private String roomNumber;
    private String building;
    private String floor;
    private ClassroomType classroomType;
    private Integer capacity;
    private Boolean hasProjector;
    private String equipmentDetails;
}
