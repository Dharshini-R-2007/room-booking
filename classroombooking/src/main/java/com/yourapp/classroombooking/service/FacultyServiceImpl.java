package com.yourapp.classroombooking.service;

import com.yourapp.classroombooking.dto.FacultyRequestDTO;
import com.yourapp.classroombooking.dto.FacultyResponseDTO;
import com.yourapp.classroombooking.entity.Faculty;
import com.yourapp.classroombooking.entity.Role;
import com.yourapp.classroombooking.entity.User;
import com.yourapp.classroombooking.exception.DuplicateFacultyException;
import com.yourapp.classroombooking.exception.FacultyNotFoundException;
import com.yourapp.classroombooking.repository.FacultyRepository;
import com.yourapp.classroombooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FacultyServiceImpl implements FacultyService {

    private final FacultyRepository facultyRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public FacultyResponseDTO createFaculty(FacultyRequestDTO request) {
        if (facultyRepository.existsByFacultyId(request.getFacultyId())) {
            throw new DuplicateFacultyException("Faculty with ID " + request.getFacultyId() + " already exists");
        }
        if (facultyRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateFacultyException("Faculty with email " + request.getEmail() + " already exists");
        }
        if (userRepository.findByUsername(request.getEmail()).isPresent()) {
            throw new DuplicateFacultyException("User with username/email " + request.getEmail() + " already exists");
        }

        Faculty faculty = Faculty.builder()
                .facultyId(request.getFacultyId())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .department(request.getDepartment())
                .designation(request.getDesignation())
                .status(request.getStatus())
                .build();

        Faculty savedFaculty = facultyRepository.save(faculty);

        // Auto-create a User record for the faculty to authenticate.
        // The default password is set to their facultyId.
        User user = User.builder()
                .username(request.getEmail())
                .password(passwordEncoder.encode(request.getFacultyId()))
                .role(Role.FACULTY)
                .build();
        userRepository.save(user);

        return FacultyResponseDTO.fromEntity(savedFaculty);
    }

    @Override
    @Transactional
    public FacultyResponseDTO updateFaculty(Long id, FacultyRequestDTO request) {
        Faculty existing = facultyRepository.findById(id)
                .orElseThrow(() -> new FacultyNotFoundException("Faculty not found with ID: " + id));

        facultyRepository.findByFacultyId(request.getFacultyId()).ifPresent(f -> {
            if (!f.getId().equals(id)) {
                throw new DuplicateFacultyException("Faculty with ID " + request.getFacultyId() + " already exists");
            }
        });

        facultyRepository.findByEmail(request.getEmail()).ifPresent(f -> {
            if (!f.getId().equals(id)) {
                throw new DuplicateFacultyException("Faculty with email " + request.getEmail() + " already exists");
            }
        });

        String oldEmail = existing.getEmail();
        String newEmail = request.getEmail();

        // If email has changed, synchronize the associated User username.
        if (!oldEmail.equalsIgnoreCase(newEmail)) {
            userRepository.findByUsername(oldEmail).ifPresent(user -> {
                user.setUsername(newEmail);
                userRepository.save(user);
            });
        }

        existing.setFacultyId(request.getFacultyId());
        existing.setFirstName(request.getFirstName());
        existing.setLastName(request.getLastName());
        existing.setEmail(request.getEmail());
        existing.setPhoneNumber(request.getPhoneNumber());
        existing.setDepartment(request.getDepartment());
        existing.setDesignation(request.getDesignation());
        existing.setStatus(request.getStatus());

        Faculty updatedFaculty = facultyRepository.save(existing);
        return FacultyResponseDTO.fromEntity(updatedFaculty);
    }

    @Override
    @Transactional
    public void deleteFaculty(Long id) {
        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new FacultyNotFoundException("Faculty not found with ID: " + id));

        // Delete associated User authentication record.
        userRepository.findByUsername(faculty.getEmail()).ifPresent(userRepository::delete);

        // Delete the Faculty record.
        facultyRepository.delete(faculty);
    }

    @Override
    @Transactional(readOnly = true)
    public FacultyResponseDTO getFacultyById(Long id) {
        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new FacultyNotFoundException("Faculty not found with ID: " + id));
        return FacultyResponseDTO.fromEntity(faculty);
    }

    @Override
    @Transactional(readOnly = true)
    public FacultyResponseDTO getFacultyByFacultyId(String facultyId) {
        Faculty faculty = facultyRepository.findByFacultyId(facultyId)
                .orElseThrow(() -> new FacultyNotFoundException("Faculty not found with Faculty ID: " + facultyId));
        return FacultyResponseDTO.fromEntity(faculty);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FacultyResponseDTO> getAllFaculty() {
        return facultyRepository.findAll().stream()
                .map(FacultyResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }
}
