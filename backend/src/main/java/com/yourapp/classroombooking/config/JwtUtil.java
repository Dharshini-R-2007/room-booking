package com.yourapp.classroombooking.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {

    // 🔐 Must be at least 32 characters for HS256
    private final String SECRET = "mysecretkeymysecretkeymysecretkey"; // Its not completely safe we can use the in java to generate the key

    private final SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes());

    // 🔹 Generate JWT Token
    public String generateToken(String username, String role) {
        return Jwts.builder()
                .subject(username)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60)) // 1 hour
                .signWith(key)
                .compact();
    }

    public String generateToken(String username) {
        return generateToken(username, null);
    }

    // 🔹 Extract username from token
    public String extractUsername(String token) {
        return getClaims(token).getSubject();
    }

    // 🔹 Extract all claims
    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}