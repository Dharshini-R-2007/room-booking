package com.yourapp.classroombooking.repository;

import com.yourapp.classroombooking.entity.Classroom;
import com.yourapp.classroombooking.entity.ClassroomStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassroomRepository extends JpaRepository<Classroom, Long>, JpaSpecificationExecutor<Classroom> {

    Optional<Classroom> findByRoomNumber(String roomNumber);

    boolean existsByRoomNumber(String roomNumber);

    List<Classroom> findByStatus(ClassroomStatus status);
}
