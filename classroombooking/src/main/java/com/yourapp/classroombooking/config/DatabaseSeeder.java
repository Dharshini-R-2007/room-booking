package com.yourapp.classroombooking.config;

import com.yourapp.classroombooking.entity.Role;
import com.yourapp.classroombooking.entity.User;
import com.yourapp.classroombooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.findByUsername("admin@college.edu").isEmpty()) {
            User admin = User.builder()
                    .username("admin@college.edu")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
            System.out.println("--------------------------------------------------");
            System.out.println("DatabaseSeeder: Seeded default Admin user: admin@college.edu / admin123");
            System.out.println("--------------------------------------------------");
        }
    }
}
