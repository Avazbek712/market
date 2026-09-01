package com.own.ownproject.controller;

import com.own.ownproject.service.UserService;
import com.own.ownproject.payload.LoginDTO;
import com.own.ownproject.payload.RegisterDTO;
import com.own.ownproject.payload.TokenDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<TokenDTO> login(@Valid @RequestBody LoginDTO dto) {
        TokenDTO login = userService.login(dto);
        return ResponseEntity.ok(login);
    }

    @PostMapping("/register")
    public ResponseEntity<TokenDTO> register(@Valid @RequestBody RegisterDTO dto) {
        TokenDTO register = userService.register(dto);
        return ResponseEntity.ok(register);
    }
}
