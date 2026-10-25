package com.yourapp.classroombooking.config;

import com.yourapp.classroombooking.entity.*;
import com.yourapp.classroombooking.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalTime;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;
    private final ClassroomRepository classroomRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Admin User
        if (userRepository.findByUsername("admin@college.edu").isEmpty()) {
            User admin = User.builder()
                    .username("admin@college.edu")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
            System.out.println("DatabaseSeeder: Seeded default Admin user: admin@college.edu / admin123");
        }

        // 2. Seed Faculty User & Record
        Faculty faculty;
        if (facultyRepository.findByEmail("faculty@college.edu").isEmpty()) {
            faculty = Faculty.builder()
                    .facultyId("FAC101")
                    .firstName("Jane")
                    .lastName("Doe")
                    .email("faculty@college.edu")
                    .phoneNumber("9876543210")
                    .department("Computer Science")
                    .designation("Associate Professor")
                    .status(FacultyStatus.ACTIVE)
                    .build();
            faculty = facultyRepository.save(faculty);

            if (userRepository.findByUsername("faculty@college.edu").isEmpty()) {
                User facultyUser = User.builder()
                        .username("faculty@college.edu")
                        .password(passwordEncoder.encode("faculty123"))
                        .role(Role.FACULTY)
                        .build();
                userRepository.save(facultyUser);
            }
            System.out.println("DatabaseSeeder: Seeded default Faculty user: faculty@college.edu / faculty123");
        } else {
            faculty = facultyRepository.findByEmail("faculty@college.edu").get();
        }

        // 3. Seed Student User & Record
        if (studentRepository.findByEmail("student@college.edu").isEmpty()) {
            User studentUser = userRepository.findByUsername("student@college.edu")
                    .orElseGet(() -> userRepository.save(User.builder()
                            .username("student@college.edu")
                            .password(passwordEncoder.encode("student123"))
                            .role(Role.STUDENT)
                            .dob("2001-05-15")
                            .build()));

            Student student = Student.builder()
                    .user(studentUser)
                    .rollNumber("CS2024001")
                    .firstName("John")
                    .lastName("Smith")
                    .email("student@college.edu")
                    .phoneNumber("1234567890")
                    .department("Computer Science")
                    .year(3)
                    .section("A")
                    .faculty(faculty)
                    .build();
            studentRepository.save(student);
            System.out.println("DatabaseSeeder: Seeded default Student user: student@college.edu / student123");
        }

        // 4. Seed sample TimeSlots if empty
        if (timeSlotRepository.count() == 0) {
            timeSlotRepository.save(TimeSlot.builder().periodNumber(1).label("Period 1 (09:00 - 10:00)").startTime(LocalTime.of(9, 0)).endTime(LocalTime.of(10, 0)).active(true).build());
            timeSlotRepository.save(TimeSlot.builder().periodNumber(2).label("Period 2 (10:00 - 11:00)").startTime(LocalTime.of(10, 0)).endTime(LocalTime.of(11, 0)).active(true).build());
            timeSlotRepository.save(TimeSlot.builder().periodNumber(3).label("Period 3 (11:00 - 12:00)").startTime(LocalTime.of(11, 0)).endTime(LocalTime.of(12, 0)).active(true).build());
            timeSlotRepository.save(TimeSlot.builder().periodNumber(4).label("Period 4 (13:00 - 14:00)").startTime(LocalTime.of(13, 0)).endTime(LocalTime.of(14, 0)).active(true).build());
            timeSlotRepository.save(TimeSlot.builder().periodNumber(5).label("Period 5 (14:00 - 15:00)").startTime(LocalTime.of(14, 0)).endTime(LocalTime.of(15, 0)).active(true).build());
            System.out.println("DatabaseSeeder: Seeded default TimeSlots");
        }

        // 5. Seed sample Classrooms if empty
        if (classroomRepository.count() == 0) {
            classroomRepository.save(Classroom.builder().roomNumber("101").building("Science Block").floor("1st Floor").classroomType(ClassroomType.CLASSROOM).capacity(60).hasProjector(true).equipmentDetails("Projector, Sound System, AC").status(ClassroomStatus.ACTIVE).build());
            classroomRepository.save(Classroom.builder().roomNumber("201").building("Tech Tower").floor("2nd Floor").classroomType(ClassroomType.LAB).capacity(40).hasProjector(true).equipmentDetails("40 Workstations, Projector").status(ClassroomStatus.ACTIVE).build());
            classroomRepository.save(Classroom.builder().roomNumber("301").building("Main Academic").floor("3rd Floor").classroomType(ClassroomType.CLASSROOM).capacity(120).hasProjector(true).equipmentDetails("Stage, Dual Projectors, Mic").status(ClassroomStatus.ACTIVE).build());
            System.out.println("DatabaseSeeder: Seeded default Classrooms");
        }
    }
}
