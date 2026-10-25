package com.yourapp.classroombooking.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentResponse {
    private Long id;
    private String username;
    private String rollNumber;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String department;
    private Integer year;
    private String section;
    private Long facultyId;
    private String facultyName;
    private LocalDateTime createdAt;
}
