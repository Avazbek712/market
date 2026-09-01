package com.own.ownproject.impl;

import com.own.ownproject.config.auth.CustomUserDetails;
import com.own.ownproject.config.auth.jwt.JwtService;
import com.own.ownproject.exception.UserNotFoundException;
import com.own.ownproject.mapper.UserMapper;
import com.own.ownproject.payload.UserMeDTO;
import com.own.ownproject.service.UserService;
import com.own.ownproject.entity.Role;
import com.own.ownproject.entity.User;
import com.own.ownproject.exception.EmailAlreadyExistsException;
import com.own.ownproject.exception.InvalidRoleException;
import com.own.ownproject.payload.LoginDTO;
import com.own.ownproject.payload.RegisterDTO;
import com.own.ownproject.payload.TokenDTO;
import com.own.ownproject.repository.RoleRepository;
import com.own.ownproject.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    // Privilege-escalation guard: self-registration must never be able to grant ADMIN
    // (or any future role) — enforced here, not just via DTO validation.
    private static final Set<String> ALLOWED_SELF_REGISTER_ROLES = Set.of("BUYER", "SELLER");

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    @Override
    public TokenDTO login(LoginDTO dto) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.getUsername(), dto.getPassword()));

        if (!(authentication.getPrincipal() instanceof CustomUserDetails userDetails)) {
            throw new RuntimeException("Unexpected authentication principal type: " + authentication.getPrincipal());
        }
        return new TokenDTO(jwtService.generateToken(userDetails));
    }

    @Override
    @Transactional
    public TokenDTO register(RegisterDTO dto) {
        if (!ALLOWED_SELF_REGISTER_ROLES.contains(dto.getRole())) {
            throw new InvalidRoleException(dto.getRole());
        }

        if (userRepository.findUserByEmail(dto.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException(dto.getEmail());
        }

        Role role = roleRepository.findByName(dto.getRole())
                .orElseThrow(() -> new RuntimeException("Role not configured: " + dto.getRole()));

        User user = new User();
        user.setEmail(dto.getEmail());
        user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        user.setFullName(dto.getFullName());
        user.setRole(role);
        userRepository.save(user);

        return new TokenDTO(jwtService.generateToken(new CustomUserDetails(user)));
    }

    @Override
    @Transactional(readOnly = true)
    public UserMeDTO me(Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findUserByEmailWithRoleAndPermissions(email)
                .orElseThrow(() -> new UserNotFoundException("User with email : " + email + "not found", HttpStatus.NOT_FOUND));

        return userMapper.userToUserMeDTO(user);
    }
}
