package com.own.ownproject.controller;

import com.own.ownproject.service.UserService;
import com.own.ownproject.payload.UserMeDTO;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/user")
@AllArgsConstructor
public class UserController {


    private final UserService userService;

    @GetMapping("me")
    public ResponseEntity<UserMeDTO> me(Authentication authentication) {
        return ResponseEntity.ok(userService.me(authentication));
    }
}
