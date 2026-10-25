package com.yourapp.classroombooking.service;

import com.yourapp.classroombooking.dto.ClassroomResponse;
import com.yourapp.classroombooking.dto.CreateClassroomRequest;
import com.yourapp.classroombooking.dto.UpdateClassroomRequest;
import com.yourapp.classroombooking.entity.ClassroomStatus;
import com.yourapp.classroombooking.entity.ClassroomType;

import java.util.List;

public interface ClassroomService {

    ClassroomResponse createClassroom(CreateClassroomRequest request);

    ClassroomResponse updateClassroom(Long id, UpdateClassroomRequest request);

    ClassroomResponse getClassroomById(Long id);

    void deleteClassroom(Long id);

    List<ClassroomResponse> getAllActiveClassrooms();

    List<ClassroomResponse> searchClassrooms(
            ClassroomType type,
            Integer minimumCapacity,
            Boolean hasProjector,
            String building,
            ClassroomStatus status);
}
