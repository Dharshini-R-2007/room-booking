package com.yourapp.classroombooking.controller;

import com.yourapp.classroombooking.dto.AuthRequest;
import com.yourapp.classroombooking.dto.AuthResponse;
import com.yourapp.classroombooking.dto.PasswordChangeRequest;
import com.yourapp.classroombooking.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public AuthResponse login(@RequestBody AuthRequest request) {
        return authService.login(request);
    }

    @PostMapping("/students/change-password")
    public ResponseEntity<String> changePassword(
            @RequestBody PasswordChangeRequest request,
            Principal principal) {
        authService.changePassword(principal.getName(), request);
        return ResponseEntity.ok("Password changed successfully");
    }
}