package com.own.ownproject.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class CategoryNotFoundException extends RuntimeException {
    private final HttpStatus httpStatus;

    public CategoryNotFoundException(String userNotFoundMsg, HttpStatus httpStatus) {
        super(userNotFoundMsg);
        this.httpStatus = httpStatus;
    }
}
