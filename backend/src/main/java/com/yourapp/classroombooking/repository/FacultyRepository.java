package com.yourapp.classroombooking.repository;

import com.yourapp.classroombooking.entity.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FacultyRepository extends JpaRepository<Faculty, Long> {

    Optional<Faculty> findByFacultyId(String facultyId);

    Optional<Faculty> findByEmail(String email);

    boolean existsByFacultyId(String facultyId);

    boolean existsByEmail(String email);
}
