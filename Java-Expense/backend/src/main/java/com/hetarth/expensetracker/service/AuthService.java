package com.hetarth.expensetracker.service;

import com.hetarth.expensetracker.dto.request.ChangePasswordRequest;
import com.hetarth.expensetracker.dto.request.LoginRequest;
import com.hetarth.expensetracker.dto.request.RegisterRequest;
import com.hetarth.expensetracker.dto.request.UpdateProfileRequest;
import com.hetarth.expensetracker.entity.User;
import com.hetarth.expensetracker.enums.Role;
import com.hetarth.expensetracker.exception.DuplicateUsernameException;
import com.hetarth.expensetracker.exception.InvalidCredentialsException;
import com.hetarth.expensetracker.exception.ResourceNotFoundException;
import com.hetarth.expensetracker.repository.UserRepository;
import com.hetarth.expensetracker.security.JwtTokenProvider;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Handles core business logic for authentication, security hashing, and profile updates.
 */
@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Transactional
    public User register(RegisterRequest request) {
        if (userRepository.existsByName(request.getName())) {
            throw new DuplicateUsernameException("Username '" + request.getName() + "' already exists");
        }

        User user = User.builder()
                .name(request.getName())
                // Securely hash incoming plain passwords
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .build();

        return userRepository.save(user);
    }

    public User login(LoginRequest request, HttpServletResponse response) {
        User user = userRepository.findByName(request.getName())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid username or password"));

        // Compare incoming plain-text credentials against stored bcrypt hash signatures
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid username or password");
        }

        // Generate signed, tamper-proof JSON Web Token
        String token = tokenProvider.generateToken(user.getName());

        // Construct HttpOnly cookie to keep token completely shielded from browser scripting (prevents XSS leaks)
        Cookie cookie = new Cookie("java_expense_token", token);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(86400); // Expiration limit: 24 hours
        cookie.setSecure(false); // Set to 'true' in HTTPS production environments!
        
        // Write the cookie directly into the HTTP Servlet response header
        response.addCookie(cookie);

        return user;
    }

    public void logout(HttpServletResponse response) {
        // Clear HttpOnly auth cookies by returning a zero-expiration record
        Cookie cookie = new Cookie("java_expense_token", null);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0); // Evict cookie immediately
        response.addCookie(cookie);
    }

    public User getCurrentUser(String username) {
        return userRepository.findByName(username)
                .orElseThrow(() -> new ResourceNotFoundException("Logged-in context user entity missing"));
    }

    @Transactional
    public User updateProfile(String username, UpdateProfileRequest request, HttpServletResponse response) {
        User user = getCurrentUser(username);

        // Check if name changed and username already exists
        if (!user.getName().equalsIgnoreCase(request.getName()) && userRepository.existsByName(request.getName())) {
            throw new DuplicateUsernameException("Username '" + request.getName() + "' already exists");
        }

        user.setName(request.getName());
        User updated = userRepository.save(user);

        // Regenerate and replace authentication cookies with updated name context
        String newToken = tokenProvider.generateToken(updated.getName());
        Cookie cookie = new Cookie("java_expense_token", newToken);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(86400);
        response.addCookie(cookie);

        return updated;
    }

    @Transactional
    public void changePassword(String username, ChangePasswordRequest request) {
        User user = getCurrentUser(username);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Incorrect current account password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
