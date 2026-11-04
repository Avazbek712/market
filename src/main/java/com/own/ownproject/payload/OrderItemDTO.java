package com.own.ownproject.payload;

import com.own.ownproject.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderItemDTO {

    private Long productId;
    private String productName;
    private BigDecimal price;
    private Integer quantity;
    private OrderStatus status;
}
