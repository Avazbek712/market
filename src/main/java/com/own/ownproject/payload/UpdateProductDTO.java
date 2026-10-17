package com.own.ownproject.payload;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateProductDTO {

    private String name;

    private String description;

    @DecimalMin(value = "0.0", inclusive = false, message = "PRODUCT_PRICE_INVALID")
    private BigDecimal price;

    @Min(value = 0, message = "PRODUCT_QUANTITY_INVALID")
    private Integer quantity;

    private Long categoryId;
}
