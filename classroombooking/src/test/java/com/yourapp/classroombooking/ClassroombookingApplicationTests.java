package com.yourapp.classroombooking;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yourapp.classroombooking.dto.*;
import com.yourapp.classroombooking.entity.FacultyStatus;
import com.yourapp.classroombooking.entity.Role;
import com.yourapp.classroombooking.entity.User;
import com.yourapp.classroombooking.repository.FacultyRepository;
import com.yourapp.classroombooking.repository.UserRepository;
import com.yourapp.classroombooking.repository.BookingRepository;
import com.yourapp.classroombooking.repository.StudentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ClassroombookingApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FacultyRepository facultyRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        bookingRepository.deleteAllInBatch();
        studentRepository.deleteAllInBatch();
        facultyRepository.deleteAllInBatch();
        userRepository.deleteAllInBatch();
    }

    @Test
    void testFacultyRegisterAndLogin() throws Exception {
        // 1. Setup Admin in DB
        User admin = User.builder()
                .username("admin@college.edu")
                .password(passwordEncoder.encode("admin123"))
                .role(Role.ADMIN)
                .build();
        userRepository.save(admin);

        // 2. Login as Admin
        AuthRequest adminLogin = new AuthRequest();
        adminLogin.setUsername("admin@college.edu");
        adminLogin.setPassword("admin123");

        String adminLoginJson = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String adminToken = objectMapper.readValue(adminLoginJson, AuthResponse.class).getToken();
        assertNotNull(adminToken);

        // 3. Admin creates Faculty
        FacultyRequestDTO createReq = FacultyRequestDTO.builder()
                .facultyId("FAC001")
                .firstName("John")
                .lastName("Doe")
                .email("faculty@college.edu")
                .phoneNumber("+1234567890")
                .department("Computer Science")
                .designation("Associate Professor")
                .status(FacultyStatus.ACTIVE)
                .build();

        mockMvc.perform(post("/api/faculties")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated());

        // 4. Verify Faculty User record is created in DB
        User savedUser = userRepository.findByUsername("faculty@college.edu").orElse(null);
        assertNotNull(savedUser);
        assertEquals(Role.FACULTY, savedUser.getRole());

        // 5. Login Faculty (using default password: facultyId)
        AuthRequest facultyLogin = new AuthRequest();
        facultyLogin.setUsername("faculty@college.edu");
        facultyLogin.setPassword("FAC001");

        String facultyLoginJson = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(facultyLogin)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        AuthResponse facultyLoginResponse = objectMapper.readValue(facultyLoginJson, AuthResponse.class);
        assertNotNull(facultyLoginResponse.getToken());
    }

    @Test
    void testAddStudentAndStudentLoginAndPasswordChange() throws Exception {
        // 1. Setup Admin in DB
        User admin = User.builder()
                .username("admin@college.edu")
                .password(passwordEncoder.encode("admin123"))
                .role(Role.ADMIN)
                .build();
        userRepository.save(admin);

        // 2. Login as Admin
        AuthRequest adminLogin = new AuthRequest();
        adminLogin.setUsername("admin@college.edu");
        adminLogin.setPassword("admin123");

        String adminLoginJson = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String adminToken = objectMapper.readValue(adminLoginJson, AuthResponse.class).getToken();

        // 3. Admin creates Faculty
        FacultyRequestDTO createReq = FacultyRequestDTO.builder()
                .facultyId("FAC002")
                .firstName("Jane")
                .lastName("Doe")
                .email("faculty2@college.edu")
                .phoneNumber("+9876543210")
                .department("Information Technology")
                .designation("Professor")
                .status(FacultyStatus.ACTIVE)
                .build();

        mockMvc.perform(post("/api/faculties")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated());

        // 4. Login as Faculty to get token
        AuthRequest facultyLogin = new AuthRequest();
        facultyLogin.setUsername("faculty2@college.edu");
        facultyLogin.setPassword("FAC002");

        String facultyLoginJson = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(facultyLogin)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String facultyToken = objectMapper.readValue(facultyLoginJson, AuthResponse.class).getToken();
        assertNotNull(facultyToken);

        // 5. Add Student (using faculty token)
        CreateStudentRequest addStudentReq = CreateStudentRequest.builder()
                .rollNumber("CS2026001")
                .firstName("John")
                .lastName("Doe")
                .email("student@college.edu")
                .phoneNumber("+1234567890")
                .department("Computer Science")
                .year(3)
                .section("A")
                .dob("01-01-2005")
                .build();

        mockMvc.perform(post("/api/students")
                        .header("Authorization", "Bearer " + facultyToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(addStudentReq)))
                .andExpect(status().isCreated());

        User studentUser = userRepository.findByUsername("student@college.edu").orElse(null);
        assertNotNull(studentUser);
        assertEquals(Role.STUDENT, studentUser.getRole());
        assertEquals("01-01-2005", studentUser.getDob());

        // 6. Login Student (using DOB as default password)
        AuthRequest studentLogin = new AuthRequest();
        studentLogin.setUsername("student@college.edu");
        studentLogin.setPassword("01-01-2005");

        String studentLoginJson = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(studentLogin)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String studentToken = objectMapper.readValue(studentLoginJson, AuthResponse.class).getToken();
        assertNotNull(studentToken);

        // 7. Change Password
        PasswordChangeRequest changeReq = new PasswordChangeRequest("01-01-2005", "newPassStudent");

        mockMvc.perform(post("/auth/students/change-password")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(changeReq)))
                .andExpect(status().isOk());

        // 8. Try logging in with OLD password (should fail)
        AuthRequest studentLoginOld = new AuthRequest();
        studentLoginOld.setUsername("student@college.edu");
        studentLoginOld.setPassword("01-01-2005");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(studentLoginOld)))
                .andExpect(status().isBadRequest());

        // 9. Login with NEW password (should succeed)
        AuthRequest studentLoginNew = new AuthRequest();
        studentLoginNew.setUsername("student@college.edu");
        studentLoginNew.setPassword("newPassStudent");

        String newLoginJson = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(studentLoginNew)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String newStudentToken = objectMapper.readValue(newLoginJson, AuthResponse.class).getToken();
        assertNotNull(newStudentToken);
    }
}
