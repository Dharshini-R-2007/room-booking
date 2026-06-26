package com.yourapp.classroombooking.service;

import com.yourapp.classroombooking.dto.ChangePasswordRequest;
import com.yourapp.classroombooking.dto.CreateStudentRequest;
import com.yourapp.classroombooking.dto.StudentResponse;
import com.yourapp.classroombooking.dto.UpdateStudentRequest;
import com.yourapp.classroombooking.entity.Faculty;
import com.yourapp.classroombooking.entity.Role;
import com.yourapp.classroombooking.entity.Student;
import com.yourapp.classroombooking.entity.User;
import com.yourapp.classroombooking.exception.*;
import com.yourapp.classroombooking.mapper.StudentMapper;
import com.yourapp.classroombooking.repository.FacultyRepository;
import com.yourapp.classroombooking.repository.StudentRepository;
import com.yourapp.classroombooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final FacultyRepository facultyRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public StudentResponse createStudent(CreateStudentRequest request, String facultyEmail) {
        if (userRepository.findByUsername(request.getEmail()).isPresent()) {
            throw new DuplicateStudentException("User with email " + request.getEmail() + " already exists");
        }
        if (studentRepository.existsByRollNumber(request.getRollNumber())) {
            throw new DuplicateStudentException("Student with roll number " + request.getRollNumber() + " already exists");
        }
        if (studentRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateStudentException("Student with email " + request.getEmail() + " already exists");
        }

        Faculty faculty = facultyRepository.findByEmail(facultyEmail)
                .orElseThrow(() -> new FacultyNotFoundException("Faculty not found with email: " + facultyEmail));

        // Create authentication User account
        User user = User.builder()
                .username(request.getEmail())
                .password(passwordEncoder.encode(request.getDob()))
                .role(Role.STUDENT)
                .dob(request.getDob())
                .build();
        User savedUser = userRepository.save(user);

        // Create Student Profile
        Student student = Student.builder()
                .user(savedUser)
                .rollNumber(request.getRollNumber())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .department(request.getDepartment())
                .year(request.getYear())
                .section(request.getSection())
                .faculty(faculty)
                .build();

        Student savedStudent = studentRepository.save(student);
        return StudentMapper.toResponse(savedStudent);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentResponse> getAllStudentsManagedBy(String facultyEmail) {
        return studentRepository.findByFacultyEmail(facultyEmail).stream()
                .map(StudentMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentResponse> getAllStudents() {
        return studentRepository.findAll().stream()
                .map(StudentMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public StudentResponse getStudentById(Long id, String facultyEmail) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new StudentNotFoundException("Student not found with ID: " + id));

        if (!student.getFaculty().getEmail().equalsIgnoreCase(facultyEmail)) {
            throw new UnauthorizedAccessException("You are not authorized to view this student record");
        }

        return StudentMapper.toResponse(student);
    }

    @Override
    @Transactional
    public StudentResponse updateStudent(Long id, UpdateStudentRequest request, String facultyEmail) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new StudentNotFoundException("Student not found with ID: " + id));

        if (!student.getFaculty().getEmail().equalsIgnoreCase(facultyEmail)) {
            throw new UnauthorizedAccessException("You are not authorized to update this student record");
        }

        // Validate roll number and email uniqueness if changed
        studentRepository.findByEmail(request.getEmail()).ifPresent(s -> {
            if (!s.getId().equals(id)) {
                throw new DuplicateStudentException("Student with email " + request.getEmail() + " already exists");
            }
        });

        // If email changed, synchronize the user username if the user's username was set to the email
        // Or if the username was independent, let's keep it. But wait, here Student has a user reference,
        // and username is distinct from email in CreateStudentRequest. Let's see if we should sync user.username.
        // The requirements say: "Student login credentials are created when faculty adds a student. Students must be able to change only their own password."
        // We will keep username as-is or sync user email if username is configured.
        
        student.setFirstName(request.getFirstName());
        student.setLastName(request.getLastName());
        student.setEmail(request.getEmail());
        student.setPhoneNumber(request.getPhoneNumber());
        student.setDepartment(request.getDepartment());
        student.setYear(request.getYear());
        student.setSection(request.getSection());

        Student updated = studentRepository.save(student);
        return StudentMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void deleteStudent(Long id, String facultyEmail) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new StudentNotFoundException("Student not found with ID: " + id));

        if (!student.getFaculty().getEmail().equalsIgnoreCase(facultyEmail)) {
            throw new UnauthorizedAccessException("You are not authorized to delete this student record");
        }

        // Delete Student profile first
        User user = student.getUser();
        studentRepository.delete(student);

        // Delete User record
        if (user != null) {
            userRepository.delete(user);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public StudentResponse getStudentProfile(String studentUsername) {
        Student student = studentRepository.findByUserUsername(studentUsername)
                .orElseThrow(() -> new StudentNotFoundException("Student profile not found for user: " + studentUsername));
        return StudentMapper.toResponse(student);
    }

    @Override
    @Transactional
    public void changeStudentPassword(String studentUsername, ChangePasswordRequest request) {
        User user = userRepository.findByUsername(studentUsername)
                .orElseThrow(() -> new StudentNotFoundException("User not found: " + studentUsername));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new InvalidBookingException("Invalid old password");
        }

        if (!request.getNewPassword().equals(request.getConfirmNewPassword())) {
            throw new InvalidBookingException("New password and confirm new password do not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
