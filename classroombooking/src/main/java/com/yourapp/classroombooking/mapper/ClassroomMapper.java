package com.yourapp.classroombooking.mapper;

import com.yourapp.classroombooking.dto.ClassroomResponse;
import com.yourapp.classroombooking.entity.Classroom;

public class ClassroomMapper {

    public static ClassroomResponse toResponse(Classroom classroom) {
        if (classroom == null) {
            return null;
        }

        return ClassroomResponse.builder()
                .id(classroom.getId())
                .roomNumber(classroom.getRoomNumber())
                .building(classroom.getBuilding())
                .floor(classroom.getFloor())
                .classroomType(classroom.getClassroomType())
                .capacity(classroom.getCapacity())
                .hasProjector(classroom.getHasProjector())
                .equipmentDetails(classroom.getEquipmentDetails())
                .status(classroom.getStatus())
                .createdAt(classroom.getCreatedAt())
                .updatedAt(classroom.getUpdatedAt())
                .build();
    }
}
