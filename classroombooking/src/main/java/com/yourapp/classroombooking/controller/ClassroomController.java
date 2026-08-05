package com.yourapp.classroombooking.controller;

import com.yourapp.classroombooking.dto.ApiResponse;
import com.yourapp.classroombooking.dto.ClassroomResponse;
import com.yourapp.classroombooking.dto.CreateClassroomRequest;
import com.yourapp.classroombooking.dto.UpdateClassroomRequest;
import com.yourapp.classroombooking.entity.ClassroomStatus;
import com.yourapp.classroombooking.entity.ClassroomType;
import com.yourapp.classroombooking.service.ClassroomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/classrooms")
@RequiredArgsConstructor
public class    ClassroomController {

    private final ClassroomService classroomService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ClassroomResponse>> createClassroom(
            @Valid @RequestBody CreateClassroomRequest request) {
        ClassroomResponse data = classroomService.createClassroom(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Classroom created successfully", data));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ClassroomResponse>> getClassroomById(@PathVariable Long id) {
        ClassroomResponse data = classroomService.getClassroomById(id);
        return ResponseEntity.ok(ApiResponse.success("Classroom retrieved successfully", data));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ClassroomResponse>> updateClassroom(
            @PathVariable Long id,
            @Valid @RequestBody UpdateClassroomRequest request) {
        ClassroomResponse data = classroomService.updateClassroom(id, request);
        return ResponseEntity.ok(ApiResponse.success("Classroom updated successfully", data));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteClassroom(@PathVariable Long id) {
        classroomService.deleteClassroom(id);
        return ResponseEntity.ok(ApiResponse.success("Classroom deleted successfully"));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'STUDENT')")
    public ResponseEntity<ApiResponse<List<ClassroomResponse>>> getAllActiveClassrooms() {
        List<ClassroomResponse> data = classroomService.getAllActiveClassrooms();
        return ResponseEntity.ok(ApiResponse.success("Active classrooms retrieved successfully", data));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'STUDENT')")
    public ResponseEntity<ApiResponse<List<ClassroomResponse>>> searchClassrooms(
            @RequestParam(required = false) ClassroomType classroomType,
            @RequestParam(required = false) Integer minimumCapacity,
            @RequestParam(required = false) Boolean hasProjector,
            @RequestParam(required = false) String building,
            @RequestParam(required = false) ClassroomStatus status) {
        List<ClassroomResponse> data = classroomService.searchClassrooms(
                classroomType, minimumCapacity, hasProjector, building, status);
        return ResponseEntity.ok(ApiResponse.success("Classrooms searched successfully", data));
    }
}
