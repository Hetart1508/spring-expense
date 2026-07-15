package com.hetarth.expensetracker.controller;

import com.hetarth.expensetracker.dto.request.ChangePasswordRequest;
import com.hetarth.expensetracker.dto.request.UpdateProfileRequest;
import com.hetarth.expensetracker.entity.User;
import com.hetarth.expensetracker.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private AuthService authService;

    // 1. Update Display Name
    @PutMapping
    public ResponseEntity<User> updateProfile(
            Principal principal,
            @Valid @RequestBody UpdateProfileRequest request,
            HttpServletResponse response
    ) {
        User updated = authService.updateProfile(principal.getName(), request, response);
        return ResponseEntity.ok(updated);
    }

    // 2. Change account password
    @PutMapping("/password")
    public ResponseEntity<Map<String, String>> changePassword(
            Principal principal,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        authService.changePassword(principal.getName(), request);
        
        Map<String, String> body = new HashMap<>();
        body.put("message", "Password changed successfully.");
        
        return ResponseEntity.ok(body);
    }
}
