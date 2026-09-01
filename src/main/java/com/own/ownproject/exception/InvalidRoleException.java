package com.own.ownproject.exception;

public class InvalidRoleException extends RuntimeException {
    public InvalidRoleException(String role) {
        super("Role not allowed for self-registration: " + role);
    }
}
