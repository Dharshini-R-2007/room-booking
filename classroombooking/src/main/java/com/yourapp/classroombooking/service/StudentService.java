package com.yourapp.classroombooking.service;

import com.yourapp.classroombooking.dto.ChangePasswordRequest;
import com.yourapp.classroombooking.dto.CreateStudentRequest;
import com.yourapp.classroombooking.dto.StudentResponse;
import com.yourapp.classroombooking.dto.UpdateStudentRequest;

import java.util.List;

public interface StudentService {

    StudentResponse createStudent(CreateStudentRequest request, String facultyEmail);

    List<StudentResponse> getAllStudentsManagedBy(String facultyEmail);

    List<StudentResponse> getAllStudents();

    StudentResponse getStudentById(Long id, String facultyEmail);

    StudentResponse updateStudent(Long id, UpdateStudentRequest request, String facultyEmail);

    void deleteStudent(Long id, String facultyEmail);

    StudentResponse getStudentProfile(String studentUsername);

    void changeStudentPassword(String studentUsername, ChangePasswordRequest request);
}
