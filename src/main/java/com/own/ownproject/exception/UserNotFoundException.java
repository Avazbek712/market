package com.own.ownproject.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class UserNotFoundException extends RuntimeException {

    private final HttpStatus httpStatus;

    public UserNotFoundException(String userNotFoundMsg, HttpStatus httpStatus) {
        super(userNotFoundMsg);
        this.httpStatus = httpStatus;
    }

}
