package com.yourapp.classroombooking.dto;

import com.yourapp.classroombooking.entity.ClassroomStatus;
import com.yourapp.classroombooking.entity.ClassroomType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateClassroomRequest {

    @NotBlank(message = "Room number is required")
    private String roomNumber;

    @NotBlank(message = "Building is required")
    private String building;

    private String floor;

    @NotNull(message = "Classroom type is required")
    private ClassroomType classroomType;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be greater than zero")
    private Integer capacity;

    @NotNull(message = "Projector availability must be specified")
    private Boolean hasProjector;

    private String equipmentDetails;

    @NotNull(message = "Status is required")
    private ClassroomStatus status;
}
