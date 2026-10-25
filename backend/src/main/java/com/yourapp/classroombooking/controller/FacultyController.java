package com.yourapp.classroombooking.controller;

import com.yourapp.classroombooking.dto.ApiResponse;
import com.yourapp.classroombooking.dto.FacultyRequestDTO;
import com.yourapp.classroombooking.dto.FacultyResponseDTO;
import com.yourapp.classroombooking.service.FacultyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/faculties")
@RequiredArgsConstructor
public class FacultyController {

    private final FacultyService facultyService;

    @PostMapping
    public ResponseEntity<ApiResponse<FacultyResponseDTO>> createFaculty(@Valid @RequestBody FacultyRequestDTO request) {
        FacultyResponseDTO data = facultyService.createFaculty(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Faculty created successfully", data));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<FacultyResponseDTO>>> getAllFaculty() {
        List<FacultyResponseDTO> data = facultyService.getAllFaculty();
        return ResponseEntity.ok(ApiResponse.success("Faculties retrieved successfully", data));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FacultyResponseDTO>> getFacultyById(@PathVariable Long id) {
        FacultyResponseDTO data = facultyService.getFacultyById(id);
        return ResponseEntity.ok(ApiResponse.success("Faculty retrieved successfully", data));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FacultyResponseDTO>> updateFaculty(
            @PathVariable Long id,
            @Valid @RequestBody FacultyRequestDTO request) {
        FacultyResponseDTO data = facultyService.updateFaculty(id, request);
        return ResponseEntity.ok(ApiResponse.success("Faculty updated successfully", data));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFaculty(@PathVariable Long id) {
        facultyService.deleteFaculty(id);
        return ResponseEntity.ok(ApiResponse.success("Faculty deleted successfully"));
    }
}
