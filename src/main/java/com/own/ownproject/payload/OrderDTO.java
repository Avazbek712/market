package com.own.ownproject.payload;

import com.own.ownproject.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderDTO {

    private Long id;
    private PaymentStatus paymentStatus;
    private List<OrderItemDTO> items;
    private BigDecimal total;
    private LocalDateTime createdAt;
}
