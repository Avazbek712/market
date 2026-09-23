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

    @NotBlank(message = "EMAIL_REQUIRED")
    @Email(message = "EMAIL_INVALID")
    private String email;

    @NotBlank(message = "PASSWORD_REQUIRED")
    // 72 максимум для Bcrypt
    @Size(min = 8, max = 72, message = "PASSWORD_LENGTH")
    private String password;

    @NotBlank(message = "FULL_NAME_REQUIRED")
    private String fullName;

    @NotBlank(message = "ROLE_REQUIRED")
    @Pattern(regexp = "BUYER|SELLER", message = "ROLE_INVALID")
    private String role;
}
