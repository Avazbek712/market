package com.own.ownproject.payload;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegisterDTO {

    @NotBlank(message = "Email must not be empty")
    @Email(message = "Email is not valid")
    private String email;

    @NotBlank(message = "Password must not be empty")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    private String password;

    @NotBlank(message = "Full name must not be empty")
    private String fullName;

    @NotBlank(message = "Role must not be empty")
    @Pattern(regexp = "BUYER|SELLER", message = "Role must be either BUYER or SELLER")
    private String role;
}
