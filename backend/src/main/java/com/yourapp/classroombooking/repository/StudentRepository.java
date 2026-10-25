package com.yourapp.classroombooking.repository;

import com.yourapp.classroombooking.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByRollNumber(String rollNumber);

    Optional<Student> findByEmail(String email);

    Optional<Student> findByUserUsername(String username);

    List<Student> findByFacultyEmail(String facultyEmail);

    boolean existsByRollNumber(String rollNumber);

    boolean existsByEmail(String email);
}
