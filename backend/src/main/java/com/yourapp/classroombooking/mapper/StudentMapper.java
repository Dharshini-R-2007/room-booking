package com.yourapp.classroombooking.mapper;

import com.yourapp.classroombooking.dto.StudentResponse;
import com.yourapp.classroombooking.entity.Student;

public class StudentMapper {

    public static StudentResponse toResponse(Student student) {
        if (student == null) {
            return null;
        }

        return StudentResponse.builder()
                .id(student.getId())
                .username(student.getUser() != null ? student.getUser().getUsername() : null)
                .rollNumber(student.getRollNumber())
                .firstName(student.getFirstName())
                .lastName(student.getLastName())
                .email(student.getEmail())
                .phoneNumber(student.getPhoneNumber())
                .department(student.getDepartment())
                .year(student.getYear())
                .section(student.getSection())
                .facultyId(student.getFaculty() != null ? student.getFaculty().getId() : null)
                .facultyName(student.getFaculty() != null ? 
                        (student.getFaculty().getFirstName() + " " + student.getFaculty().getLastName()).trim() : null)
                .createdAt(student.getCreatedAt())
                .build();
    }
}
