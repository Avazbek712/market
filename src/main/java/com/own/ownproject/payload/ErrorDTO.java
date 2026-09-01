package com.own.ownproject.payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ErrorDTO {

    private int status;
    private String message;

    private List<FieldErrorDTO> fieldsErrors;

    public ErrorDTO(int status, String message) {
        this.status = status;
        this.message = message;
    }
}
