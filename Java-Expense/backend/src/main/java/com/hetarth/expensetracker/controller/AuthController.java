package com.hetarth.expensetracker.controller;

import com.hetarth.expensetracker.dto.request.LoginRequest;
import com.hetarth.expensetracker.dto.request.RegisterRequest;
import com.hetarth.expensetracker.entity.User;
import com.hetarth.expensetracker.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

/**
 * Controller handling user registration, cookie logins, logouts, and token syncs.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    // 1. REGISTER: Create new username / bcrypt records
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody RegisterRequest request) {
        User user = authService.register(request);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Account registered successfully.");
        response.put("userId", user.getId());
        response.put("username", user.getName());
        
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // 2. LOGIN: Verify hash, generate JWT, write HTTP-only cookie
    @PostMapping("/login")
    public ResponseEntity<User> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response
    ) {
        User user = authService.login(request, response);
        return ResponseEntity.ok(user);
    }

    // 3. LOGOUT: Clear HTTP-only auth cookies
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletResponse response) {
        authService.logout(response);
        
        Map<String, String> body = new HashMap<>();
        body.put("message", "Successfully logged out. Authentication cookie cleared.");
        
        return ResponseEntity.ok(body);
    }

    // 4. ME: Fetch current logged-in user state.
    // Spring Security automatically injects the authenticated User identity into the 'Principal' object.
    @GetMapping("/me")
    public ResponseEntity<User> getMe(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = authService.getCurrentUser(principal.getName());
        return ResponseEntity.ok(user);
    }
}
