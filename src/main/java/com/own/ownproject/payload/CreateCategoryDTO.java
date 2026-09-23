package com.own.ownproject.payload;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateCategoryDTO {

    @NotBlank(message = "CATEGORY_NAME_REQUIRED")
    private String categoryName;

    private String categoryDescription;

}
