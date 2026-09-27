package com.own.ownproject.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class ProductNotFoundException extends RuntimeException {
    private final HttpStatus httpStatus;

    public ProductNotFoundException(String message, HttpStatus httpStatus) {
        super(message);
        this.httpStatus = httpStatus;
    }
}
