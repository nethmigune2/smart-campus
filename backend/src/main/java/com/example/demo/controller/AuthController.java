package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.security.CustomOAuth2User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof CustomOAuth2User oauthUser)) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        User user = oauthUser.getUser();
        return ResponseEntity.ok(Map.of(
                "id",        user.getId(),
                "name",      user.getName(),
                "email",     user.getEmail(),
                "role",      user.getRole().name(),
                "avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : ""
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}
