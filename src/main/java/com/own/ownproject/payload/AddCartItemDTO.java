package com.own.ownproject.payload;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AddCartItemDTO {

    @NotNull(message = "PRODUCT_ID_REQUIRED")
    private Long productId;

    @NotNull(message = "CART_QUANTITY_REQUIRED")
    @Min(value = 1, message = "CART_QUANTITY_INVALID")
    private Integer quantity;
}
