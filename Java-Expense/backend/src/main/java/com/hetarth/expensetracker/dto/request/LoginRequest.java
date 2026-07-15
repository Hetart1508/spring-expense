package com.hetarth.expensetracker.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO for incoming user login payloads.
 */
@Getter
@Setter
public class LoginRequest {

    @NotBlank(message = "Username cannot be empty")
    private String name;

    @NotBlank(message = "Password cannot be empty")
    private String password;
}
