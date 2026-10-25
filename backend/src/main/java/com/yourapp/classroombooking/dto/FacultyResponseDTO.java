package com.yourapp.classroombooking.dto;

import com.yourapp.classroombooking.entity.Faculty;
import com.yourapp.classroombooking.entity.FacultyStatus;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FacultyResponseDTO {

    private Long id;
    private String facultyId;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String department;
    private String designation;
    private FacultyStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static FacultyResponseDTO fromEntity(Faculty faculty) {
        if (faculty == null) {
            return null;
        }
        return FacultyResponseDTO.builder()
                .id(faculty.getId())
                .facultyId(faculty.getFacultyId())
                .firstName(faculty.getFirstName())
                .lastName(faculty.getLastName())
                .email(faculty.getEmail())
                .phoneNumber(faculty.getPhoneNumber())
                .department(faculty.getDepartment())
                .designation(faculty.getDesignation())
                .status(faculty.getStatus())
                .createdAt(faculty.getCreatedAt())
                .updatedAt(faculty.getUpdatedAt())
                .build();
    }
}
