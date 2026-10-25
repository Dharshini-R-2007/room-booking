package com.yourapp.classroombooking.service;

import com.yourapp.classroombooking.dto.ClassroomResponse;
import com.yourapp.classroombooking.dto.CreateClassroomRequest;
import com.yourapp.classroombooking.dto.UpdateClassroomRequest;
import com.yourapp.classroombooking.entity.Classroom;
import com.yourapp.classroombooking.entity.ClassroomStatus;
import com.yourapp.classroombooking.entity.ClassroomType;
import com.yourapp.classroombooking.exception.ClassroomNotFoundException;
import com.yourapp.classroombooking.exception.DuplicateClassroomException;
import com.yourapp.classroombooking.mapper.ClassroomMapper;
import com.yourapp.classroombooking.repository.ClassroomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.criteria.Predicate;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClassroomServiceImpl implements ClassroomService {

    private final ClassroomRepository classroomRepository;

    @Override
    @Transactional
    public ClassroomResponse createClassroom(CreateClassroomRequest request) {
        if (classroomRepository.existsByRoomNumberAndBuilding(request.getRoomNumber(), request.getBuilding())) {
            throw new DuplicateClassroomException("Classroom with room number " + request.getRoomNumber() + " already exists in block/building " + request.getBuilding());
        }

        Classroom classroom = Classroom.builder()
                .roomNumber(request.getRoomNumber())
                .building(request.getBuilding())
                .floor(request.getFloor())
                .classroomType(request.getClassroomType())
                .capacity(request.getCapacity())
                .hasProjector(request.getHasProjector())
                .equipmentDetails(request.getEquipmentDetails())
                .status(request.getStatus())
                .build();

        Classroom saved = classroomRepository.save(classroom);
        return ClassroomMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public ClassroomResponse updateClassroom(Long id, UpdateClassroomRequest request) {
        Classroom classroom = classroomRepository.findById(id)
                .orElseThrow(() -> new ClassroomNotFoundException("Classroom not found with ID: " + id));

        if (classroomRepository.existsByRoomNumberAndBuildingAndIdNot(classroom.getRoomNumber(), request.getBuilding(), id)) {
            throw new DuplicateClassroomException("Classroom with room number " + classroom.getRoomNumber() + " already exists in block/building " + request.getBuilding());
        }

        classroom.setBuilding(request.getBuilding());
        classroom.setFloor(request.getFloor());
        classroom.setClassroomType(request.getClassroomType());
        classroom.setCapacity(request.getCapacity());
        classroom.setHasProjector(request.getHasProjector());
        classroom.setEquipmentDetails(request.getEquipmentDetails());
        classroom.setStatus(request.getStatus());

        Classroom updated = classroomRepository.save(classroom);
        return ClassroomMapper.toResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public ClassroomResponse getClassroomById(Long id) {
        Classroom classroom = classroomRepository.findById(id)
                .orElseThrow(() -> new ClassroomNotFoundException("Classroom not found with ID: " + id));
        return ClassroomMapper.toResponse(classroom);
    }

    @Override
    @Transactional
    public void deleteClassroom(Long id) {
        if (!classroomRepository.existsById(id)) {
            throw new ClassroomNotFoundException("Classroom not found with ID: " + id);
        }
        classroomRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClassroomResponse> getAllActiveClassrooms() {
        return classroomRepository.findAll().stream()
                .map(ClassroomMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClassroomResponse> searchClassrooms(
            ClassroomType type,
            Integer minimumCapacity,
            Boolean hasProjector,
            String building,
            ClassroomStatus status) {

        Specification<Classroom> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (type != null) {
                predicates.add(cb.equal(root.get("classroomType"), type));
            }
            if (minimumCapacity != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("capacity"), minimumCapacity));
            }
            if (hasProjector != null) {
                predicates.add(cb.equal(root.get("hasProjector"), hasProjector));
            }
            if (building != null && !building.trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("building")), "%" + building.trim().toLowerCase() + "%"));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return classroomRepository.findAll(spec).stream()
                .map(ClassroomMapper::toResponse)
                .collect(Collectors.toList());
    }
}
