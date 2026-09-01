package com.own.ownproject.service;

import com.own.ownproject.payload.LoginDTO;
import com.own.ownproject.payload.RegisterDTO;
import com.own.ownproject.payload.TokenDTO;
import com.own.ownproject.payload.UserMeDTO;
import org.springframework.security.core.Authentication;

public interface UserService {
    TokenDTO login(LoginDTO dto);

    TokenDTO register(RegisterDTO dto);

    UserMeDTO me(Authentication authentication);
}
