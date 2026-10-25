package com.yourapp.classroombooking.controller;

import com.yourapp.classroombooking.dto.*;
import com.yourapp.classroombooking.service.StudentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    @PostMapping
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ApiResponse<StudentResponse>> createStudent(
            @Valid @RequestBody CreateStudentRequest request,
            Principal principal) {
        StudentResponse data = studentService.createStudent(request, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Student created successfully", data));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<StudentResponse>>> getStudents(
            Principal principal,
            HttpServletRequest request) {
        List<StudentResponse> data;
        if (request.isUserInRole("ADMIN")) {
            data = studentService.getAllStudents();
        } else {
            data = studentService.getAllStudentsManagedBy(principal.getName());
        }
        return ResponseEntity.ok(ApiResponse.success("Students retrieved successfully", data));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ApiResponse<StudentResponse>> getStudentById(
            @PathVariable Long id,
            Principal principal) {
        StudentResponse data = studentService.getStudentById(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Student retrieved successfully", data));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ApiResponse<StudentResponse>> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStudentRequest request,
            Principal principal) {
        StudentResponse data = studentService.updateStudent(id, request, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Student updated successfully", data));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ApiResponse<Void>> deleteStudent(
            @PathVariable Long id,
            Principal principal) {
        studentService.deleteStudent(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Student deleted successfully"));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<StudentResponse>> getMyProfile(Principal principal) {
        StudentResponse data = studentService.getStudentProfile(principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Student profile retrieved successfully", data));
    }

    @PutMapping("/me/password")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<Void>> changeMyPassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Principal principal) {
        studentService.changeStudentPassword(principal.getName(), request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully"));
    }
}
