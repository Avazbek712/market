package com.own.ownproject.payload;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateProductDTO {

    @NotBlank(message = "PRODUCT_NAME_REQUIRED")
    private String name;

    private String description;

    @NotNull(message = "PRODUCT_PRICE_REQUIRED")
    @DecimalMin(value = "0.0", inclusive = false, message = "PRODUCT_PRICE_INVALID")
    private BigDecimal price;

    @NotNull(message = "PRODUCT_QUANTITY_REQUIRED")
    @Min(value = 0, message = "PRODUCT_QUANTITY_INVALID")
    private Integer quantity;

    private Long categoryId;
}