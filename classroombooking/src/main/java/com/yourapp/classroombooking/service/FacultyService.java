package com.yourapp.classroombooking.service;

import com.yourapp.classroombooking.dto.FacultyRequestDTO;
import com.yourapp.classroombooking.dto.FacultyResponseDTO;

import java.util.List;

public interface FacultyService {

    FacultyResponseDTO createFaculty(FacultyRequestDTO request);

    FacultyResponseDTO updateFaculty(Long id, FacultyRequestDTO request);

    void deleteFaculty(Long id);

    FacultyResponseDTO getFacultyById(Long id);

    FacultyResponseDTO getFacultyByFacultyId(String facultyId);

    List<FacultyResponseDTO> getAllFaculty();
}
