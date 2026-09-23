package com.own.ownproject.handler;

import com.own.ownproject.exception.CategoryNotFoundException;
import com.own.ownproject.exception.EmailAlreadyExistsException;
import com.own.ownproject.exception.InvalidRoleException;
import com.own.ownproject.exception.UserNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {


    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<?> handleIllegalStateException(IllegalStateException exception) {
        log.warn("Illegal state", exception);
        return buildResponse(HttpStatus.BAD_REQUEST, "ILLEGAL_STATE");
    }

    @ExceptionHandler(CategoryNotFoundException.class)
    public ResponseEntity<?> handleCategoryNotFound(CategoryNotFoundException exception) {
        return buildResponse(exception.getHttpStatus(), "CATEGORY_NOT_FOUND");
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationException(MethodArgumentNotValidException exception) {
        List<Map<String, String>> fieldErrors = exception.getBindingResult().getFieldErrors().stream()
                .map(fe -> Map.of("field", fe.getField(), "code", String.valueOf(fe.getDefaultMessage())))
                .collect(Collectors.toList());

        Map<String, Object> body = errorBody(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR");
        body.put("fieldErrors", fieldErrors);
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<?> handleAuthenticationException(AuthenticationException exception) {
        return buildResponse(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS");
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<?> handleAccessDeniedException(AccessDeniedException exception) {
        return buildResponse(HttpStatus.FORBIDDEN, "ACCESS_DENIED");
    }

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<?> handleEmailAlreadyExists(EmailAlreadyExistsException exception) {
        return buildResponse(HttpStatus.CONFLICT, "EMAIL_ALREADY_EXISTS");
    }

    @ExceptionHandler(InvalidRoleException.class)
    public ResponseEntity<?> handleInvalidRole(InvalidRoleException exception) {
        return buildResponse(HttpStatus.BAD_REQUEST, "INVALID_ROLE");
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<?> handleUserNotFound(UserNotFoundException exception) {
        return buildResponse(exception.getHttpStatus(), "USER_NOT_FOUND");
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<?> handleDataIntegrityViolation(DataIntegrityViolationException exception) {
        return buildResponse(HttpStatus.CONFLICT, "DUPLICATE_DATA");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGenericException(Exception e) {
        log.error("Unexpected error", e);
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR");
    }


    private ResponseEntity<Map<String, Object>> buildResponse(HttpStatus status, String code) {
        return new ResponseEntity<>(errorBody(status, code), status);
    }

    private Map<String, Object> errorBody(HttpStatus status, String code) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy.MM.dd HH:mm:ss")));
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("code", code);
        return body;
    }

}
